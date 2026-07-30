import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Order, { OrderStatus } from "@/models/Order";

const validStatuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    const { status } = body;

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        order: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin order status update error:", error);

    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 },
    );
  }
}
