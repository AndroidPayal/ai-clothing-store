import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { releaseOrderInventory } from "@/lib/releaseOrderInventory";
import Order from "@/models/Order";
import mongoose from "mongoose";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const allowedStatuses = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof allowedStatuses)[number];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Pending", "Cancelled"],
  Confirmed: ["Confirmed", "Shipped"],
  Shipped: ["Shipped", "Delivered"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    /* =====================================================
       ADMIN CHECK
    ===================================================== */

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    /* =====================================================
       GET ORDER ID
    ===================================================== */

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    /* =====================================================
       READ REQUEST
    ===================================================== */

    const body = await request.json();

    const requestedStatus = body?.status;

    if (
      typeof requestedStatus !== "string" ||
      !allowedStatuses.includes(requestedStatus as OrderStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid order status" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const newStatus = requestedStatus as OrderStatus;

    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    /*
     * IMPORTANT:
     *
     * Do NOT use:
     *
     *   order.status = newStatus;
     *   await order.save();
     *
     * because older orders may not contain newly-required
     * fields such as checkoutIdempotencyKey or
     * inventory.expiresAt.
     *
     * findOneAndUpdate() changes only the status field and
     * therefore does not revalidate the entire old document.
     */

    const existingOrder = await Order.findById(id)
      .select("status payment.razorpayPaymentId inventory")
      .lean();

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const currentStatus = existingOrder.status as OrderStatus;

    if (
      ["Confirmed", "Shipped", "Delivered"].includes(newStatus) &&
      !existingOrder.payment?.razorpayPaymentId
    ) {
      return NextResponse.json(
        { message: "An order cannot be fulfilled before payment confirmation" },
        { status: 409, headers: corsHeaders },
      );
    }

    /* =====================================================
       STATUS TRANSITION VALIDATION
    ===================================================== */

    const allowedNextStatuses = allowedTransitions[currentStatus];

    if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          message: `Cannot change order status from ${currentStatus} to ${newStatus}`,
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (currentStatus === "Pending" && newStatus === "Cancelled") {
      const released = await releaseOrderInventory(id);
      if (!released) {
        return NextResponse.json(
          { message: "Could not safely release reserved inventory" },
          { status: 409, headers: corsHeaders },
        );
      }
      const order = await Order.findById(id).lean();
      return NextResponse.json(
        { message: "Order cancelled and inventory released", order },
        { status: 200, headers: corsHeaders },
      );
    }

    /* =====================================================
       UPDATE ONLY STATUS
    ===================================================== */

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        status: currentStatus,
      },
      {
        $set: {
          status: newStatus,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        {
          message:
            "Order was changed by another request. Please refresh and try again.",
        },
        {
          status: 409,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        order: updatedOrder,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("ADMIN ORDER STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update order status",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
