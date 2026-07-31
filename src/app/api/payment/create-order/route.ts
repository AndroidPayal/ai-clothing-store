import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid payment amount",
        },
        {
          status: 400,
        },
      );
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        order,
      },
      {
        status: 200,
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
      },
    );
  }
}
