import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

await mongoose.connect(process.env.MONGODB_URI);

try {
  const collection = mongoose.connection.collection("orders");

  const checks = [
    {
      name: "checkout",
      match: {
        checkoutIdempotencyKey: { $exists: true, $ne: "" },
      },
      group: {
        _id: {
          userId: "$userId",
          checkoutIdempotencyKey: "$checkoutIdempotencyKey",
        },
        count: { $sum: 1 },
      },
    },
    {
      name: "razorpayOrder",
      match: {
        "payment.razorpayOrderId": { $exists: true, $ne: "" },
      },
      group: {
        _id: "$payment.razorpayOrderId",
        count: { $sum: 1 },
      },
    },
    {
      name: "razorpayPayment",
      match: {
        "payment.razorpayPaymentId": { $exists: true, $ne: "" },
      },
      group: {
        _id: "$payment.razorpayPaymentId",
        count: { $sum: 1 },
      },
    },
    {
      name: "razorpayRefund",
      match: {
        "payment.razorpayRefundId": { $exists: true, $ne: "" },
      },
      group: {
        _id: "$payment.razorpayRefundId",
        count: { $sum: 1 },
      },
    },
  ];

  let duplicatesFound = false;

  for (const check of checks) {
    const rows = await collection
      .aggregate([
        { $match: check.match },
        { $group: check.group },
        { $match: { count: { $gt: 1 } } },
        { $limit: 10 },
      ])
      .toArray();

    console.log(`${check.name}:`, rows);

    if (rows.length > 0) {
      duplicatesFound = true;
    }
  }

  if (duplicatesFound) {
    console.error("Duplicate values found. Do NOT create unique indexes yet.");
    process.exitCode = 1;
  } else {
    console.log("No duplicate values found.");
  }
} finally {
  await mongoose.disconnect();
}
