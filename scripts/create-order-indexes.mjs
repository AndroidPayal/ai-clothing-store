import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

await mongoose.connect(process.env.MONGODB_URI);

try {
  const collection = mongoose.connection.collection("orders");

  await collection.createIndex(
    { userId: 1, checkoutIdempotencyKey: 1 },
    {
      name: "unique_user_checkout_idempotency",
      unique: true,
      partialFilterExpression: {
        checkoutIdempotencyKey: { $exists: true },
      },
    },
  );

  await collection.createIndex(
    { "payment.razorpayOrderId": 1 },
    {
      name: "unique_razorpay_order_id",
      unique: true,
      partialFilterExpression: {
        "payment.razorpayOrderId": { $exists: true },
      },
    },
  );

  await collection.createIndex(
    { "payment.razorpayPaymentId": 1 },
    {
      name: "unique_razorpay_payment_id",
      unique: true,
      partialFilterExpression: {
        "payment.razorpayPaymentId": { $exists: true },
      },
    },
  );

  await collection.createIndex(
    { "payment.razorpayRefundId": 1 },
    {
      name: "unique_razorpay_refund_id",
      unique: true,
      partialFilterExpression: {
        "payment.razorpayRefundId": { $exists: true },
      },
    },
  );

  console.log("All required order indexes created successfully.");
} finally {
  await mongoose.disconnect();
}
