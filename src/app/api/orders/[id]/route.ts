import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  try {
    // Authenticate the request
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

    const { id } = await context.params;

    // Prevent invalid MongoDB ObjectId from becoming a 500 error
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    // IMPORTANT:
    // Only return an order belonging to the authenticated user.
    // This prevents users from accessing another user's order by changing the ID.
    const order = await Order.findOne({
      _id: id,
      userId: user.id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      { order },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET ORDER DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch order" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
