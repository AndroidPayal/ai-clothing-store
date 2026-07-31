import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
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
        },
      );
    }

    await connectDB();

    const newOrder = await Order.create({
      userId: session.user.id,

      items,

      total,

      customer,

      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },

      status: "Confirmed",
    });

    return NextResponse.json(
      {
        message: "Payment verified and order created successfully",
        order: newOrder,
      },
      {
        status: 201,
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
      },
    );
  }
}
