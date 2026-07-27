import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
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

    const { id } = await context.params;

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        order,
      },
      {
        status: 200,
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
      },
    );
  }
}
