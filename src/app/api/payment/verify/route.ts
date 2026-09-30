import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { releaseOrderInventory } from "@/lib/releaseOrderInventory";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Idempotency-Key",
};

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

function sanitizeOrder(order: {
  toObject?: () => Record<string, unknown>;
  [key: string]: unknown;
}) {
  const plain = order.toObject ? order.toObject() : { ...order };

  const payment = plain.payment;

  if (payment && typeof payment === "object" && !Array.isArray(payment)) {
    const paymentData = payment as Record<string, unknown>;
    delete paymentData.razorpaySignature;
  }

  const inventory = plain.inventory;

  if (inventory && typeof inventory === "object" && !Array.isArray(inventory)) {
    const inventoryData = inventory as Record<string, unknown>;
    delete inventoryData.reservedAt;
    delete inventoryData.expiresAt;
  }

  return plain;
}

function getRefundErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return "Automatic refund failed";
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // 1. Authenticate
    // -----------------------------------------
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return jsonResponse(
        {
          message: "Unauthorized",
        },
        401,
      );
    }

    // -----------------------------------------
    // 2. Razorpay configuration
    // -----------------------------------------
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("RAZORPAY CREDENTIALS ARE MISSING");

      return jsonResponse(
        {
          message: "Payment service is not configured",
        },
        500,
      );
    }

    // -----------------------------------------
    // 3. Parse request
    // -----------------------------------------
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          message: "Invalid request body",
        },
        400,
      );
    }

    if (!body || typeof body !== "object") {
      return jsonResponse(
        {
          message: "Invalid request body",
        },
        400,
      );
    }

    const razorpayOrderId =
      "razorpayOrderId" in body && typeof body.razorpayOrderId === "string"
        ? body.razorpayOrderId.trim()
        : "";

    const razorpayPaymentId =
      "razorpayPaymentId" in body && typeof body.razorpayPaymentId === "string"
        ? body.razorpayPaymentId.trim()
        : "";

    const razorpaySignature =
      "razorpaySignature" in body && typeof body.razorpaySignature === "string"
        ? body.razorpaySignature.trim()
        : "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return jsonResponse(
        {
          message: "Invalid payment verification data",
        },
        400,
      );
    }

    console.log("RAZORPAY VERIFY RECEIVED:", {
      razorpayOrderId,
      razorpayPaymentId,
      hasSignature: Boolean(razorpaySignature),
      signatureLength: razorpaySignature.length,
    });
    // -----------------------------------------
    // 4. Database
    // -----------------------------------------
    await connectDB();

    // -----------------------------------------
    // 5. Find internal order
    // -----------------------------------------
    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
      userId: user.id,
    });

    if (!order) {
      return jsonResponse(
        {
          message: "Order not found",
        },
        404,
      );
    }
    // -----------------------------------------
    // 6. Already processed payment
    // -----------------------------------------
    if (order.payment?.razorpayPaymentId) {
      if (order.payment.razorpayPaymentId === razorpayPaymentId) {
        // The payment may have been confirmed by the webhook before
        // this verify request reached the atomic confirmation step.
        //
        // We still need to cryptographically verify the checkout
        // signature before storing it.
        const generatedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`, "utf8")
          .digest("hex");

        if (!safeCompare(razorpaySignature, generatedSignature)) {
          return jsonResponse(
            {
              message: "Payment verification failed",
            },
            400,
          );
        }

        // Store the valid checkout signature if it was not already saved.
        if (!order.payment.razorpaySignature) {
          const updatedOrder = await Order.findOneAndUpdate(
            {
              _id: order._id,
              userId: user.id,
              "payment.razorpayPaymentId": razorpayPaymentId,
              "payment.razorpaySignature": {
                $in: [null, ""],
              },
            },
            {
              $set: {
                "payment.razorpaySignature": razorpaySignature,
              },
            },
            {
              new: true,
            },
          );

          if (updatedOrder) {
            return jsonResponse({
              message: "Payment already verified",
              order: sanitizeOrder(updatedOrder),
            });
          }
        }

        if (order.payment.refundStatus === "Refunded") {
          return jsonResponse(
            {
              message: "Payment was already refunded",
              refunded: true,
              refundId: order.payment.razorpayRefundId || null,
              order: sanitizeOrder(order),
            },
            409,
          );
        }

        if (order.payment.refundStatus === "Processing") {
          return jsonResponse(
            {
              message: "Refund is already being processed",
              refunded: false,
              requiresReconciliation: true,
            },
            409,
          );
        }

        return jsonResponse({
          message: "Payment already verified",
          order: sanitizeOrder(order),
        });
      }

      return jsonResponse(
        {
          message: "Order has already been processed",
        },
        409,
      );
    }
    // -----------------------------------------
    // 7. Order must be pending
    // -----------------------------------------
    if (order.status !== "Pending") {
      return jsonResponse(
        {
          message: "This order is no longer eligible for payment verification",
        },
        409,
      );
    }

    // -----------------------------------------
    // 8. Verify Razorpay signature
    // -----------------------------------------
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`, "utf8")
      .digest("hex");

    if (!safeCompare(razorpaySignature, generatedSignature)) {
      return jsonResponse(
        {
          message: "Payment verification failed",
        },
        400,
      );
    }

    // -----------------------------------------
    // 9. Razorpay client
    // -----------------------------------------
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // -----------------------------------------
    // 10. Fetch payment from Razorpay
    // -----------------------------------------
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (!payment) {
      return jsonResponse(
        {
          message: "Payment not found",
        },
        400,
      );
    }

    // -----------------------------------------
    // 11. Validate payment ownership
    // -----------------------------------------
    if (payment.order_id !== razorpayOrderId) {
      return jsonResponse(
        {
          message: "Payment does not belong to this order",
        },
        400,
      );
    }

    // -----------------------------------------
    // 12. Validate currency
    // -----------------------------------------
    if (payment.currency !== "INR") {
      return jsonResponse(
        {
          message: "Invalid payment currency",
        },
        400,
      );
    }

    // -----------------------------------------
    // 13. Validate amount
    // -----------------------------------------
    const expectedAmount = Math.round(Number(order.total) * 100);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      payment.amount !== expectedAmount
    ) {
      return jsonResponse(
        {
          message: "Payment amount mismatch",
        },
        400,
      );
    }

    // -----------------------------------------
    // 14. Payment not captured
    // -----------------------------------------
    if (payment.status !== "captured") {
      let inventoryReleased = false;

      if (
        order.inventory?.reserved === true &&
        order.inventory?.released === false
      ) {
        inventoryReleased = await releaseOrderInventory(order._id.toString());
      }

      return jsonResponse(
        {
          message: `Payment is not captured. Current status: ${payment.status}`,
          inventoryReleased,
        },
        400,
      );
    }

    // -----------------------------------------
    // 15. Validate inventory reservation
    // -----------------------------------------
    const reservationExpired =
      !order.inventory?.expiresAt ||
      order.inventory.expiresAt.getTime() <= Date.now();

    const inventoryReleased =
      order.inventory?.released === true || order.inventory?.reserved !== true;

    if (reservationExpired || inventoryReleased) {
      // ---------------------------------------
      // 15A. Restore expired reservation first
      // ---------------------------------------
      const released = await releaseOrderInventory(order._id.toString());

      if (!released) {
        const latestOrder = await Order.findById(order._id);

        if (latestOrder?.inventory?.released !== true) {
          console.error("FAILED TO RELEASE EXPIRED INVENTORY BEFORE REFUND:", {
            orderId: order._id.toString(),
            paymentId: razorpayPaymentId,
          });

          return jsonResponse(
            {
              message:
                "Payment was captured, but inventory could not be safely released. Refund requires reconciliation.",
              refunded: false,
              requiresReconciliation: true,
            },
            500,
          );
        }
      }

      // ---------------------------------------
      // 15B. Atomically claim refund ownership
      // ---------------------------------------
      const refundClaim = await Order.findOneAndUpdate(
        {
          _id: order._id,
          userId: user.id,
          status: "Cancelled",
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
            "payment.razorpayPaymentId": razorpayPaymentId,
            "payment.razorpaySignature": razorpaySignature,
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

      // ---------------------------------------
      // 15C. Another request already owns refund
      // ---------------------------------------
      if (!refundClaim) {
        const latestOrder = await Order.findById(order._id);

        if (
          latestOrder?.payment?.razorpayRefundId &&
          latestOrder.payment.refundStatus === "Refunded"
        ) {
          return jsonResponse(
            {
              message: "Payment was already refunded",
              refunded: true,
              refundId: latestOrder.payment.razorpayRefundId,
              order: sanitizeOrder(latestOrder),
            },
            409,
          );
        }

        if (
          latestOrder?.payment?.razorpayPaymentId === razorpayPaymentId &&
          latestOrder?.payment?.refundStatus === "Processing"
        ) {
          return jsonResponse(
            {
              message: "Refund is already being processed",
              refunded: false,
              requiresReconciliation: true,
            },
            409,
          );
        }

        return jsonResponse(
          {
            message: "Payment refund is already being processed",
            refunded: false,
            requiresReconciliation: true,
          },
          409,
        );
      }

      // ---------------------------------------
      // 15D. Check remote refund state
      // ---------------------------------------
      try {
        const amountRefunded = Number(payment.amount_refunded ?? 0);

        if (
          !Number.isInteger(amountRefunded) ||
          amountRefunded < 0 ||
          amountRefunded > expectedAmount
        ) {
          throw new Error("Invalid refunded amount reported by Razorpay");
        }

        const remainingAmount = expectedAmount - amountRefunded;

        // -------------------------------------
        // Already fully refunded remotely
        // -------------------------------------
        if (remainingAmount === 0) {
          const refundedOrder = await Order.findOneAndUpdate(
            {
              _id: order._id,
              userId: user.id,
              "payment.razorpayPaymentId": razorpayPaymentId,
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

          if (!refundedOrder) {
            return jsonResponse(
              {
                message:
                  "Payment was already refunded, but order state requires reconciliation.",
                refunded: true,
                requiresReconciliation: true,
              },
              500,
            );
          }

          return jsonResponse(
            {
              message: "Payment was already refunded",
              refunded: true,
              refundId: refundedOrder.payment?.razorpayRefundId || null,
              order: sanitizeOrder(refundedOrder),
            },
            409,
          );
        }

        // -------------------------------------
        // 15E. Refund only remaining amount
        // -------------------------------------
        const refund = await razorpay.payments.refund(razorpayPaymentId, {
          amount: remainingAmount,
          notes: {
            reason: "Inventory reservation expired before payment verification",
            internal_order_id: order._id.toString(),
          },
        });

        // -------------------------------------
        // 15F. Persist successful refund
        // -------------------------------------
        const refundedOrder = await Order.findOneAndUpdate(
          {
            _id: order._id,
            userId: user.id,
            "payment.razorpayPaymentId": razorpayPaymentId,
            "payment.refundStatus": "Processing",
          },
          {
            $set: {
              "payment.refundStatus": "Refunded",
              "payment.razorpayRefundId": refund.id,
              "payment.refundError": "",
              status: "Cancelled",
            },
          },
          {
            new: true,
          },
        );

        if (!refundedOrder) {
          console.error("REFUND SUCCEEDED BUT ORDER STATE UPDATE FAILED:", {
            orderId: order._id.toString(),
            paymentId: razorpayPaymentId,
            refundId: refund.id,
          });

          return jsonResponse(
            {
              message:
                "Payment was refunded, but order state requires reconciliation.",
              refunded: true,
              refundId: refund.id,
              requiresReconciliation: true,
            },
            500,
          );
        }

        console.log("PAYMENT REFUNDED AFTER EXPIRED INVENTORY:", {
          orderId: order._id.toString(),
          paymentId: razorpayPaymentId,
          refundId: refund.id,
          refundedAmount: remainingAmount,
        });

        return jsonResponse(
          {
            message:
              "Payment was received after the inventory reservation expired. The payment has been refunded and the order was cancelled.",
            refunded: true,
            refundId: refund.id,
            order: sanitizeOrder(refundedOrder),
          },
          409,
        );
      } catch (refundError) {
        const refundErrorMessage = getRefundErrorMessage(refundError);

        console.error("PAYMENT REFUND FAILED AFTER EXPIRED RESERVATION:", {
          orderId: order._id.toString(),
          paymentId: razorpayPaymentId,
          error: refundError,
        });

        // -------------------------------------
        // 15G. Persist refund failure
        // -------------------------------------
        await Order.updateOne(
          {
            _id: order._id,
            userId: user.id,
            "payment.razorpayPaymentId": razorpayPaymentId,
            "payment.refundStatus": "Processing",
          },
          {
            $set: {
              "payment.refundStatus": "Failed",
              "payment.refundError": refundErrorMessage,
              "payment.refundLastAttemptAt": new Date(),
            },
          },
        );

        return jsonResponse(
          {
            message:
              "Payment was captured, but the inventory reservation had expired. Automatic refund could not be completed. Please contact support.",
            refunded: false,
            requiresReconciliation: true,
          },
          500,
        );
      }
    }

    // -----------------------------------------
    // 16. Atomic payment confirmation
    // -----------------------------------------
    const confirmedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        userId: user.id,
        status: "Pending",
        "payment.razorpayOrderId": razorpayOrderId,
        "payment.razorpayPaymentId": {
          $in: [null, ""],
        },
        "payment.refundStatus": {
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
          "payment.razorpayPaymentId": razorpayPaymentId,
          "payment.razorpaySignature": razorpaySignature,
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

    // -----------------------------------------
    // 17. Concurrent request lost the race
    // -----------------------------------------
    if (!confirmedOrder) {
      const latestOrder = await Order.findById(order._id);

      if (latestOrder?.payment?.razorpayPaymentId === razorpayPaymentId) {
        if (latestOrder.payment.refundStatus === "Refunded") {
          return jsonResponse(
            {
              message: "Payment was already refunded",
              refunded: true,
              refundId: latestOrder.payment.razorpayRefundId || null,
              order: sanitizeOrder(latestOrder),
            },
            409,
          );
        }

        if (latestOrder.payment.refundStatus === "Processing") {
          return jsonResponse(
            {
              message: "Refund is already being processed",
              refunded: false,
              requiresReconciliation: true,
            },
            409,
          );
        }

        return jsonResponse({
          message: "Payment already verified",
          order: sanitizeOrder(latestOrder),
        });
      }

      if (latestOrder?.status === "Cancelled") {
        return jsonResponse(
          {
            message: "This order was cancelled before payment confirmation.",
            requiresReconciliation: true,
          },
          409,
        );
      }

      return jsonResponse(
        {
          message: "Payment verification is already being processed",
        },
        409,
      );
    }

    console.log(
      "PAYMENT VERIFIED AND ORDER CONFIRMED:",
      confirmedOrder._id.toString(),
    );

    // -----------------------------------------
    // 18. Safe response
    // -----------------------------------------

    return jsonResponse({
      message: "Payment verified and order confirmed successfully",
      order: sanitizeOrder(confirmedOrder),
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    return jsonResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      500,
    );
  }
}
