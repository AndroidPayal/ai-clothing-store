import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

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
    // Supports both:
    // 1. NextAuth session (web)
    // 2. Mobile JWT Bearer token (mobile app)
    const user = await getAuthenticatedUser(request);

    console.log("PAYMENT CREATE ORDER USER:", user);

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const body = await request.json();

    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid payment amount",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    console.log("RAZORPAY ORDER CREATED:", order.id);

    return NextResponse.json(
      {
        order,
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
