import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const orders = await Order.find({
      userId: user.id,
    })
      .select(
        "items total customer payment.razorpayOrderId payment.razorpayPaymentId status createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { orders },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

/*
 * Direct order creation is disabled.
 *
 * Orders must be created through:
 * POST /api/payment/create-order
 *
 * This prevents clients from submitting manipulated
 * prices, totals, product information, or order data.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        message:
          "Direct order creation is disabled. Please use the payment checkout flow.",
      },
      {
        status: 405,
        headers: {
          ...corsHeaders,
          Allow: "GET, OPTIONS",
        },
      },
    );
  } catch (error) {
    console.error("ORDER POST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to process order request" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
