import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { buildTrustedOrderData, validateCustomer } from "@/lib/checkout";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    const trustedCustomer = validateCustomer(body.customer);

    await connectDB();

    // NEVER trust price/total/product details from the browser.
    const { items, total } = await buildTrustedOrderData(body.items);

    // Create Razorpay order using SERVER-CALCULATED total.
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}_${user.id}`,
    });

    // Save a pending order before payment.
    const pendingOrder = await Order.create({
      userId: user.id,
      items,
      total,
      customer: trustedCustomer,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: "",
        razorpaySignature: "",
      },
      status: "Pending",
    });

    return NextResponse.json(
      {
        order: razorpayOrder,
        internalOrderId: pendingOrder._id.toString(),
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment order",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
