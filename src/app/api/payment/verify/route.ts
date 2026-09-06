import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await request.json();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { message: "Invalid payment verification data" },
        { status: 400, headers: corsHeaders },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(razorpaySignature, "utf8"),
    );

    if (!signaturesMatch) {
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400, headers: corsHeaders },
      );
    }

    await connectDB();

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
      userId: user.id,
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    // Prevent duplicate verification/order processing.
    if (order.payment.razorpayPaymentId) {
      return NextResponse.json(
        {
          message: "Payment already verified",
          order,
        },
        {
          status: 200,
          headers: corsHeaders,
        },
      );
    }

    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.status = "Confirmed";

    await order.save();

    return NextResponse.json(
      {
        message: "Payment verified and order confirmed successfully",
        order,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
