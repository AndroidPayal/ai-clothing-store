import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const { items, total, customer } = body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof total !== "number" ||
      total <= 0 ||
      !customer
    ) {
      return NextResponse.json(
        {
          message: "Invalid order data",
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
    });

    console.log("ORDER CREATED:", newOrder._id);

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: newOrder,
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create order",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function GET(request: Request) {
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

    await connectDB();

    const orders = await Order.find({
      userId: user.id,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        orders,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch orders",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
