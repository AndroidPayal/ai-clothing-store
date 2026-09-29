import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import RazorpayWebhookEvent from "@/models/RazorpayWebhookEvent";
import { releaseOrderInventory } from "@/lib/releaseOrderInventory";

const corsHeaders = {
  "Content-Type": "application/json",
};

const WEBHOOK_PROCESSING_LEASE_MS = 5 * 60 * 1000;

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

function safeCompare(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function isDuplicateKeyError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  );
}

async function updateWebhookEvent(
  eventId: string,
  update: Record<string, unknown>,
) {
  try {
    await RazorpayWebhookEvent.updateOne({ eventId }, { $set: update });
  } catch (error) {
    console.error("FAILED TO UPDATE WEBHOOK EVENT:", error);
  }
}

type RazorpayPayment = {
  id?: string;
  amount?: number;
  amount_refunded?: number;
  currency?: string;
  order_id?: string;
  status?: string;
};

export async function POST(request: Request) {
  let webhookEventId = "";

  try {
    // -----------------------------------------
    // 1. Verify webhook configuration
    // -----------------------------------------
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET IS NOT CONFIGURED");

      return jsonResponse(
        {
          message: "Webhook is not configured",
        },
        500,
      );
    }

    // -----------------------------------------
    // 2. Read raw body
    // -----------------------------------------
    const rawBody = await request.text();

    if (!rawBody) {
      return jsonResponse(
        {
          message: "Empty webhook body",
        },
        400,
      );
    }

    // -----------------------------------------
    // 3. Verify Razorpay signature
    // -----------------------------------------
    const razorpaySignature = request.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      return jsonResponse(
        {
          message: "Missing Razorpay webhook signature",
        },
        400,
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody, "utf8")
      .digest("hex");

    if (!safeCompare(razorpaySignature, expectedSignature)) {
      console.error("INVALID RAZORPAY WEBHOOK SIGNATURE");

      return jsonResponse(
        {
          message: "Invalid webhook signature",
        },
        401,
      );
    }

    // -----------------------------------------
    // 4. Webhook event ID
    // -----------------------------------------
    webhookEventId = request.headers.get("x-razorpay-event-id")?.trim() || "";

    if (!webhookEventId) {
      return jsonResponse(
        {
          message: "Missing Razorpay webhook event ID",
        },
        400,
      );
    }

    // -----------------------------------------
    // 5. Parse payload
    // -----------------------------------------
    let payload: {
      event?: unknown;
      payload?: {
        payment?: {
          entity?: {
            id?: unknown;
            order_id?: unknown;
            amount?: unknown;
            currency?: unknown;
            status?: unknown;
          };
        };
      };
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          message: "Invalid webhook payload",
        },
        400,
      );
    }

    const event = typeof payload.event === "string" ? payload.event : "";

    /*
     * Only process successful payment events.
     */
    if (event !== "payment.captured" && event !== "order.paid") {
      return jsonResponse({
        message: "Webhook received",
      });
    }

    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      return jsonResponse(
        {
          message: "Payment data missing from webhook",
        },
        400,
      );
    }

    const paymentId = typeof payment.id === "string" ? payment.id.trim() : "";

    const razorpayOrderId =
      typeof payment.order_id === "string" ? payment.order_id.trim() : "";

    const amount = Number(payment.amount);

    const currency =
      typeof payment.currency === "string" ? payment.currency : "";

    const paymentStatus =
      typeof payment.status === "string" ? payment.status : "";

    if (!paymentId || !razorpayOrderId || !Number.isFinite(amount)) {
      return jsonResponse(
        {
          message: "Invalid payment data",
        },
        400,
      );
    }

    if (paymentStatus !== "captured" || currency !== "INR") {
      return jsonResponse({
        message: "Webhook received but payment is not captured",
      });
    }

    await connectDB();

    // -----------------------------------------
    // 6. Claim webhook event
    // -----------------------------------------
    try {
      await RazorpayWebhookEvent.create({
        eventId: webhookEventId,
        event,
        status: "Processing",
        paymentId,
        processingStartedAt: new Date(),
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const existing = await RazorpayWebhookEvent.findOne({
        eventId: webhookEventId,
      });

      if (!existing) {
        return jsonResponse(
          {
            message: "Webhook event state could not be determined",
          },
          500,
        );
      }

      if (existing.status === "Processed") {
        return jsonResponse({
          message: "Webhook already processed",
        });
      }

      if (existing.status === "Processing") {
        const processingStartedAt =
          existing.processingStartedAt?.getTime() ??
          existing.updatedAt.getTime();

        const processingAge = Date.now() - processingStartedAt;

        if (processingAge < WEBHOOK_PROCESSING_LEASE_MS) {
          return jsonResponse(
            {
              message: "Webhook is already being processed",
            },
            409,
          );
        }

        const reclaimed = await RazorpayWebhookEvent.findOneAndUpdate(
          {
            eventId: webhookEventId,
            status: "Processing",
            processingStartedAt: {
              $lt: new Date(Date.now() - WEBHOOK_PROCESSING_LEASE_MS),
            },
          },
          {
            $set: {
              processingStartedAt: new Date(),
              error: "",
              paymentId,
            },
          },
          {
            new: true,
          },
        );

        if (!reclaimed) {
          return jsonResponse(
            {
              message: "Webhook is already being processed",
            },
            409,
          );
        }
      } else if (existing.status === "Failed") {
        const retried = await RazorpayWebhookEvent.findOneAndUpdate(
          {
            eventId: webhookEventId,
            status: "Failed",
          },
          {
            $set: {
              status: "Processing",
              error: "",
              paymentId,
              processingStartedAt: new Date(),
            },
          },
          {
            new: true,
          },
        );

        if (!retried) {
          return jsonResponse(
            {
              message: "Webhook retry could not be claimed",
            },
            409,
          );
        }
      }
    }

    // -----------------------------------------
    // 7. Find internal order
    // -----------------------------------------
    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
    });

    if (!order) {
      console.error("RAZORPAY WEBHOOK ORDER NOT FOUND:", razorpayOrderId);

      await updateWebhookEvent(webhookEventId, {
        status: "Failed",
        error: "Order not found",
      });

      return jsonResponse({
        message: "Order not found",
        requiresReconciliation: true,
      });
    }

    // -----------------------------------------
    // 8. Verify amount
    // -----------------------------------------
    const expectedAmount = Math.round(Number(order.total) * 100);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      amount !== expectedAmount
    ) {
      console.error("RAZORPAY WEBHOOK AMOUNT MISMATCH:", {
        orderId: order._id.toString(),
        expectedAmount,
        receivedAmount: amount,
      });

      await updateWebhookEvent(webhookEventId, {
        status: "Failed",
        orderId: order._id.toString(),
        error: "Payment amount mismatch",
      });

      return jsonResponse(
        {
          message: "Payment amount mismatch",
        },
        400,
      );
    }

    // -----------------------------------------
    // 9. Payment already processed
    // -----------------------------------------
    if (order.payment.razorpayPaymentId) {
      if (order.payment.razorpayPaymentId === paymentId) {
        await updateWebhookEvent(webhookEventId, {
          status: "Processed",
          orderId: order._id.toString(),
        });

        return jsonResponse({
          message: "Webhook already processed",
        });
      }

      console.error(
        "DIFFERENT PAYMENT ALREADY ATTACHED TO ORDER:",
        order._id.toString(),
      );

      await updateWebhookEvent(webhookEventId, {
        status: "Failed",
        orderId: order._id.toString(),
        error: "Different payment already attached",
      });

      return jsonResponse(
        {
          message: "Order already has a different payment",
        },
        409,
      );
    }

    // -----------------------------------------
    // 10. Order must still be pending
    // -----------------------------------------
    if (order.status !== "Pending") {
      await updateWebhookEvent(webhookEventId, {
        status: "Processed",
        orderId: order._id.toString(),
      });

      return jsonResponse({
        message: "Order is no longer pending",
      });
    }

    // -----------------------------------------
    // 11. Check inventory reservation
    // -----------------------------------------
    const reservationActive =
      order.inventory?.reserved === true &&
      order.inventory?.released !== true &&
      !!order.inventory?.expiresAt &&
      order.inventory.expiresAt.getTime() > Date.now();

    // -----------------------------------------
    // 12. Expired / released inventory
    // -----------------------------------------
    if (!reservationActive) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        console.error("RAZORPAY API CREDENTIALS MISSING DURING REFUND");

        await updateWebhookEvent(webhookEventId, {
          status: "Failed",
          orderId: order._id.toString(),
          error: "Razorpay credentials missing during refund",
        });

        return jsonResponse(
          {
            message:
              "Payment captured but refund could not be initiated automatically",
            requiresReconciliation: true,
          },
          500,
        );
      }

      /*
       * If the reservation has expired but stock has not
       * yet been released, restore the stock first.
       *
       * releaseOrderInventory() performs the stock restore
       * and order cancellation atomically.
       */
      const released = await releaseOrderInventory(order._id.toString());

      if (!released) {
        const latestAfterRelease = await Order.findById(order._id)
          .select("status inventory payment")
          .lean();

        const alreadyReleased =
          latestAfterRelease?.inventory?.released === true;

        if (!alreadyReleased) {
          await updateWebhookEvent(webhookEventId, {
            status: "Failed",
            orderId: order._id.toString(),
            error: "Inventory release failed before refund",
          });

          return jsonResponse(
            {
              message: "Payment captured but inventory release failed",
              refunded: false,
              requiresReconciliation: true,
            },
            500,
          );
        }
      }

      /*
       * Claim refund processing.
       *
       * Require the exact cancelled/released state so a refund
       * can never be claimed against an unexpected inventory state.
       */
      const refundClaim = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: "Cancelled",
          "inventory.reserved": false,
          "inventory.released": true,
          "payment.razorpayPaymentId": {
            $in: [null, ""],
          },
          "payment.refundStatus": {
            $in: [null, ""],
          },
        },
        {
          $set: {
            "payment.razorpayPaymentId": paymentId,
            "payment.refundStatus": "Processing",
            "payment.refundLastAttemptAt": new Date(),
            "payment.refundError": "",
          },
          $inc: {
            "payment.refundAttemptCount": 1,
          },
        },
        {
          new: true,
        },
      );

      /*
       * Another process may have claimed the refund.
       */
      if (!refundClaim) {
        const latest = await Order.findById(order._id);

        if (
          latest?.payment?.refundStatus === "Refunded" ||
          latest?.payment?.razorpayRefundId
        ) {
          await updateWebhookEvent(webhookEventId, {
            status: "Processed",
            orderId: order._id.toString(),
          });

          return jsonResponse({
            message: "Refund already processed",
            refunded: true,
          });
        }

        if (
          latest?.payment?.razorpayPaymentId === paymentId &&
          latest?.payment?.refundStatus === "Processing"
        ) {
          return jsonResponse(
            {
              message: "Refund is already being processed",
              requiresReconciliation: true,
            },
            409,
          );
        }

        await updateWebhookEvent(webhookEventId, {
          status: "Failed",
          orderId: order._id.toString(),
          error: "Refund state could not be claimed",
        });

        return jsonResponse(
          {
            message: "Payment refund is already being processed",
            requiresReconciliation: true,
          },
          409,
        );
      }

      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        /*
         * Always inspect the remote payment before
         * requesting another refund.
         */
        const remotePayment = (await razorpay.payments.fetch(
          paymentId,
        )) as RazorpayPayment;

        // -----------------------------------------
        // Strictly validate remote payment
        // -----------------------------------------
        if (
          remotePayment.order_id &&
          remotePayment.order_id !== razorpayOrderId
        ) {
          throw new Error(
            "Razorpay payment does not belong to the webhook order",
          );
        }

        if (remotePayment.currency !== "INR") {
          throw new Error("Razorpay payment currency does not match INR");
        }

        if (
          !Number.isInteger(remotePayment.amount) ||
          remotePayment.amount !== expectedAmount
        ) {
          throw new Error(
            "Razorpay payment amount does not match the order amount",
          );
        }

        if (remotePayment.status !== "captured") {
          throw new Error(
            `Razorpay payment is not captured. Current status: ${
              remotePayment.status || "unknown"
            }`,
          );
        }

        const amountRefunded = Number(remotePayment.amount_refunded ?? 0);

        if (
          !Number.isInteger(amountRefunded) ||
          amountRefunded < 0 ||
          amountRefunded > expectedAmount
        ) {
          throw new Error("Invalid refunded amount reported by Razorpay");
        }

        if (amountRefunded === expectedAmount) {
          const updated = await Order.findOneAndUpdate(
            {
              _id: order._id,
              "payment.razorpayPaymentId": paymentId,
              "payment.refundStatus": "Processing",
            },
            {
              $set: {
                "payment.refundStatus": "Refunded",
                "payment.refundError": "",
                status: "Cancelled",
              },
            },
            {
              new: true,
            },
          );

          if (!updated) {
            throw new Error(
              "Remote refund is complete but order state could not be updated",
            );
          }

          await updateWebhookEvent(webhookEventId, {
            status: "Processed",
            orderId: order._id.toString(),
          });

          return jsonResponse({
            message: "Payment was already refunded",
            refunded: true,
          });
        }

        /*
         * If a partial refund already exists, request
         * only the remaining amount.
         */
        const remainingAmount = expectedAmount - amountRefunded;

        if (!Number.isInteger(remainingAmount) || remainingAmount <= 0) {
          throw new Error("Invalid remaining refund amount");
        }

        const refund = await razorpay.payments.refund(paymentId, {
          amount: remainingAmount,
          notes: {
            reason:
              "Inventory reservation expired before payment webhook processing",
            internal_order_id: order._id.toString(),
          },
        });

        /*
         * Razorpay refund succeeded.
         * Persist the result atomically.
         */
        const refundedOrder = await Order.findOneAndUpdate(
          {
            _id: order._id,
            "payment.razorpayPaymentId": paymentId,
            "payment.refundStatus": "Processing",
          },
          {
            $set: {
              "payment.refundStatus": "Refunded",
              "payment.razorpayRefundId": refund?.id ?? "",
              "payment.refundError": "",
              status: "Cancelled",
            },
          },
          {
            new: true,
          },
        );

        if (!refundedOrder) {
          console.error(
            "REFUND COMPLETED BUT ORDER STATE UPDATE FAILED:",
            order._id.toString(),
          );

          await updateWebhookEvent(webhookEventId, {
            status: "Failed",
            orderId: order._id.toString(),
            error: "Refund completed but order update failed",
          });

          return jsonResponse(
            {
              message: "Refund completed but order reconciliation is required",
              refunded: true,
              requiresReconciliation: true,
            },
            500,
          );
        }

        await updateWebhookEvent(webhookEventId, {
          status: "Processed",
          orderId: order._id.toString(),
        });

        console.log("CAPTURED PAYMENT REFUNDED:", {
          orderId: order._id.toString(),
          paymentId,
          refundId: refund?.id,
        });

        return jsonResponse({
          message:
            "Payment received after inventory reservation expired. Payment refunded and order cancelled.",
          refunded: true,
        });
      } catch (refundError) {
        const errorMessage =
          refundError instanceof Error
            ? refundError.message
            : "Automatic refund failed";

        /*
         * Keep the payment ID and durable failure state.
         * reconcile-refunds can retry this later.
         */
        await Order.findOneAndUpdate(
          {
            _id: order._id,
            "payment.razorpayPaymentId": paymentId,
            "payment.refundStatus": "Processing",
          },
          {
            $set: {
              "payment.refundStatus": "Failed",
              "payment.refundError": errorMessage.slice(0, 1000),
              "payment.refundLastAttemptAt": new Date(),
            },
          },
        );

        await updateWebhookEvent(webhookEventId, {
          status: "Failed",
          orderId: order._id.toString(),
          error: "Automatic refund failed",
        });

        console.error("AUTOMATIC PAYMENT REFUND FAILED:", {
          orderId: order._id.toString(),
          paymentId,
          error: refundError,
        });

        return jsonResponse(
          {
            message: "Payment captured but automatic refund failed",
            refunded: false,
            requiresReconciliation: true,
          },
          500,
        );
      }
    }

    // -----------------------------------------
    // 13. Confirm order atomically
    // -----------------------------------------
    const confirmedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: "Pending",
        "payment.razorpayOrderId": razorpayOrderId,
        "payment.razorpayPaymentId": {
          $in: [null, ""],
        },
        "inventory.reserved": true,
        "inventory.released": false,
        "inventory.expiresAt": {
          $gt: new Date(),
        },
      },
      {
        $set: {
          "payment.razorpayPaymentId": paymentId,
          "payment.refundStatus": "",
          "inventory.reserved": false,
          "inventory.released": false,
          status: "Confirmed",
        },
      },
      {
        new: true,
      },
    );

    if (!confirmedOrder) {
      const latest = await Order.findById(order._id);

      if (latest?.payment?.razorpayPaymentId === paymentId) {
        await updateWebhookEvent(webhookEventId, {
          status: "Processed",
          orderId: order._id.toString(),
        });

        return jsonResponse({
          message: "Payment already processed",
        });
      }

      await updateWebhookEvent(webhookEventId, {
        status: "Failed",
        orderId: order._id.toString(),
        error: "Order confirmation race or invalid state",
      });

      return jsonResponse(
        {
          message: "Payment processing is already in progress",
          requiresReconciliation: true,
        },
        409,
      );
    }

    await updateWebhookEvent(webhookEventId, {
      status: "Processed",
      orderId: confirmedOrder._id.toString(),
    });

    console.log(
      "RAZORPAY WEBHOOK CONFIRMED ORDER:",
      confirmedOrder._id.toString(),
    );

    return jsonResponse({
      message: "Payment webhook processed successfully",
    });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    if (webhookEventId) {
      await updateWebhookEvent(webhookEventId, {
        status: "Failed",
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      });
    }

    return jsonResponse(
      {
        message: "Webhook processing failed",
        requiresReconciliation: true,
      },
      500,
    );
  }
}
