import crypto from "crypto";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

function safeSecretCompare(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function authorized(request: Request) {
  const configured = process.env.REFUND_RECONCILIATION_SECRET;
  const received = request.headers.get("x-refund-reconciliation-secret") || "";

  if (configured && safeSecretCompare(received, configured)) {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (
    cronSecret &&
    authorization &&
    safeSecretCompare(authorization, `Bearer ${cronSecret}`)
  ) {
    return true;
  }

  return false;
}

type RazorpayPayment = {
  amount?: number;
  amount_refunded?: number;
  currency?: string;
  order_id?: string;
  status?: string;
};

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { message: "Payment configuration missing" },
      { status: 500 },
    );
  }

  await connectDB();

  const stale = new Date(Date.now() - 5 * 60_000);

  const orders = await Order.find({
    status: "Cancelled",
    "payment.razorpayPaymentId": { $nin: ["", null] },
    $or: [
      {
        "payment.refundStatus": "Failed",
      },
      {
        "payment.refundStatus": "Processing",
        "payment.refundLastAttemptAt": { $lt: stale },
      },
      {
        "payment.refundStatus": "Processing",
        "payment.refundLastAttemptAt": null,
      },
    ],
  })
    .select("_id total payment status")
    .limit(50)
    .lean();

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let refunded = 0;
  let failed = 0;

  for (const candidate of orders) {
    const paymentId = candidate.payment?.razorpayPaymentId;

    if (!paymentId) {
      continue;
    }

    const expectedAmount = Math.round(Number(candidate.total) * 100);

    if (!Number.isInteger(expectedAmount) || expectedAmount <= 0) {
      failed++;

      await Order.updateOne(
        {
          _id: candidate._id,
          "payment.refundStatus": {
            $in: ["Failed", "Processing"],
          },
        },
        {
          $set: {
            "payment.refundStatus": "Failed",
            "payment.refundError":
              "Invalid order amount during refund reconciliation",
            "payment.refundLastAttemptAt": new Date(),
          },
          $inc: {
            "payment.refundAttemptCount": 1,
          },
        },
      );

      continue;
    }

    /*
     * Atomically claim this refund attempt.
     */
    const claimed = await Order.findOneAndUpdate(
      {
        _id: candidate._id,
        status: "Cancelled",
        "payment.razorpayPaymentId": paymentId,
        "payment.refundStatus": {
          $in: ["Failed", "Processing"],
        },
      },
      {
        $set: {
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

    if (!claimed) {
      continue;
    }

    try {
      /*
       * Always inspect Razorpay first.
       *
       * This protects against the case where Razorpay processed
       * a previous refund but MongoDB was not updated.
       */
      const payment = (await razorpay.payments.fetch(
        paymentId,
      )) as RazorpayPayment;

      // -----------------------------------------
      // Validate remote payment ownership
      // -----------------------------------------
      if (
        payment.order_id &&
        claimed.payment?.razorpayOrderId &&
        payment.order_id !== claimed.payment.razorpayOrderId
      ) {
        throw new Error(
          "Razorpay payment does not belong to the stored Razorpay order",
        );
      }

      // -----------------------------------------
      // Validate remote currency
      // -----------------------------------------
      if (payment.currency !== "INR") {
        throw new Error("Razorpay payment currency does not match INR");
      }

      // -----------------------------------------
      // Validate remote original amount
      // -----------------------------------------
      if (
        !Number.isInteger(payment.amount) ||
        payment.amount !== expectedAmount
      ) {
        throw new Error(
          "Razorpay payment amount does not match the order amount",
        );
      }

      // -----------------------------------------
      // Validate payment state
      // -----------------------------------------
      if (payment.status !== "captured") {
        throw new Error(
          `Razorpay payment is not captured. Current status: ${payment.status || "unknown"}`,
        );
      }

      const amountRefunded = Number(payment.amount_refunded ?? 0);

      if (!Number.isInteger(amountRefunded) || amountRefunded < 0) {
        throw new Error("Invalid refunded amount reported by Razorpay");
      }

      // -----------------------------------------
      // Never accept an unexpected over-refund
      // -----------------------------------------
      if (amountRefunded > expectedAmount) {
        throw new Error(
          "Razorpay reports a refunded amount greater than the order amount",
        );
      }

      // -----------------------------------------
      // Already fully refunded remotely
      // -----------------------------------------
      if (amountRefunded === expectedAmount) {
        const updated = await Order.updateOne(
          {
            _id: claimed._id,
            "payment.refundStatus": "Processing",
          },
          {
            $set: {
              "payment.refundStatus": "Refunded",
              "payment.refundError": "",
            },
          },
        );

        if (updated.modifiedCount !== 1) {
          throw new Error(
            "Remote refund is complete but order state could not be updated",
          );
        }

        refunded++;
        continue;
      }

      // -----------------------------------------
      // Refund only the remaining amount
      // -----------------------------------------
      const remainingAmount = expectedAmount - amountRefunded;

      if (remainingAmount <= 0) {
        throw new Error("Invalid remaining refund amount");
      }

      const refund = await razorpay.payments.refund(paymentId, {
        amount: remainingAmount,
        notes: {
          internal_order_id: claimed._id.toString(),
          reconciliation: "true",
        },
      });

      /*
       * Razorpay accepted the refund.
       *
       * Persist the refund ID and final state.
       */
      const updated = await Order.updateOne(
        {
          _id: claimed._id,
          "payment.refundStatus": "Processing",
        },
        {
          $set: {
            "payment.refundStatus": "Refunded",
            "payment.razorpayRefundId": refund.id,
            "payment.refundError": "",
          },
        },
      );

      if (updated.modifiedCount !== 1) {
        console.error("REFUND SUCCEEDED BUT ORDER STATE UPDATE FAILED:", {
          orderId: claimed._id.toString(),
          paymentId,
          refundId: refund.id,
        });

        /*
         * Do not mark this as an ordinary failure.
         *
         * Razorpay already received the refund request.
         * Keeping Processing allows the next reconciliation
         * run to inspect Razorpay again before retrying.
         */
        continue;
      }

      refunded++;
    } catch (error) {
      failed++;

      const errorMessage =
        error instanceof Error ? error.message : "Refund reconciliation failed";

      await Order.updateOne(
        {
          _id: claimed._id,
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
    }
  }

  return NextResponse.json({
    checked: orders.length,
    refunded,
    failed,
    manualAttentionCount: failed,
    requiresManualAttention: failed > 0,
  });
}
