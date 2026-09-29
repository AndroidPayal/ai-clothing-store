import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

await mongoose.connect(process.env.MONGODB_URI);

try {
  const collection = mongoose.connection.collection("orders");

  const requiredIndexes = [
    "unique_user_checkout_idempotency",
    "unique_razorpay_order_id",
    "unique_razorpay_payment_id",
    "unique_razorpay_refund_id",
  ];

  const indexes = await collection.indexes();

  const missingIndexes = requiredIndexes.filter(
    (name) => !indexes.some((index) => index.name === name),
  );

  if (missingIndexes.length) {
    console.error("Missing required indexes:", missingIndexes);
  }

  let duplicatesFound = false;

  const duplicateChecks = [
    {
      label: "checkout idempotency key",
      match: {
        checkoutIdempotencyKey: { $exists: true, $ne: "" },
      },
      groupId: {
        userId: "$userId",
        checkoutIdempotencyKey: "$checkoutIdempotencyKey",
      },
    },
    {
      label: "Razorpay order ID",
      match: {
        "payment.razorpayOrderId": { $exists: true, $ne: "" },
      },
      groupId: "$payment.razorpayOrderId",
    },
    {
      label: "Razorpay payment ID",
      match: {
        "payment.razorpayPaymentId": { $exists: true, $ne: "" },
      },
      groupId: "$payment.razorpayPaymentId",
    },
    {
      label: "Razorpay refund ID",
      match: {
        "payment.razorpayRefundId": { $exists: true, $ne: "" },
      },
      groupId: "$payment.razorpayRefundId",
    },
  ];

  for (const check of duplicateChecks) {
    const rows = await collection
      .aggregate([
        {
          $match: check.match,
        },
        {
          $group: {
            _id: check.groupId,
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    if (rows.length > 0) {
      duplicatesFound = true;
      console.error(`Duplicate ${check.label} values found:`, rows);
    }
  }

  if (missingIndexes.length || duplicatesFound) {
    console.error("Payment index verification FAILED.");
    if (missingIndexes.length) {
      console.error("Missing indexes:", missingIndexes);
    }
    if (duplicatesFound) {
      console.error("Duplicate payment/idempotency values were found.");
    }
    process.exitCode = 1;
  } else {
    console.log("Payment indexes and duplicate checks passed.");
  }
} finally {
  await mongoose.disconnect();
}
