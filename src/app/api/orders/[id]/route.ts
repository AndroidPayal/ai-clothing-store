import { NextResponse } from "next/server";
import { auth } from "@/auth";
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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const { id } = await context.params;

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      userId: user.id,
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "Order not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

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
    console.error("GET ORDER DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch order",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
