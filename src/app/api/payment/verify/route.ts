import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
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

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      total,
      customer,
    } = body;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !items ||
      items.length === 0 ||
      !total ||
      !customer
    ) {
      return NextResponse.json(
        {
          message: "Invalid payment verification data",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        {
          message: "Payment verification failed",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const newOrder = await Order.create({
      userId: user.id,

      items,

      total,

      customer,

      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },

      status: "Confirmed",
      headers: corsHeaders,
    });

    return NextResponse.json(
      {
        message: "Payment verified and order created successfully",
        order: newOrder,
      },
      {
        status: 201,
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
