import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: Request) {
  try {
    const session = await auth();

    console.log("ORDER SESSION:", session);

    if (!session?.user?.id) {
      console.log("NO USER ID FOUND IN SESSION");

      return NextResponse.json(
        {
          message: "Unauthorized - User ID not found",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    console.log("ORDER BODY:", body);

    const { items, total, customer } = body;

    if (!items || items.length === 0 || !total || !customer) {
      return NextResponse.json(
        {
          message: "Invalid order data",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    console.log("MongoDB connected");

    const newOrder = await Order.create({
      userId: session.user.id,
      items,
      total,
      customer,
    });

    console.log("ORDER CREATED:", newOrder);

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: newOrder,
      },
      {
        status: 201,
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
      },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    console.log("GET ORDERS SESSION:", session);

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

    await connectDB();

    const orders = await Order.find({
      userId: session.user.id,
    }).sort({
      createdAt: -1,
    });

    console.log("USER ORDERS FOUND:", orders.length);

    return NextResponse.json(
      {
        orders,
      },
      {
        status: 200,
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
      },
    );
  }
}
