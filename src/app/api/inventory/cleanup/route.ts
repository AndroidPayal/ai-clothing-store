import crypto from "crypto";
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { releaseOrderInventory } from "@/lib/releaseOrderInventory";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Inventory-Cleanup-Secret",
};

const BATCH_SIZE = 100;

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

function safeSecretCompare(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function authorized(request: Request) {
  const cleanupSecret = process.env.INVENTORY_CLEANUP_SECRET;
  const providedSecret =
    request.headers.get("x-inventory-cleanup-secret") || "";

  if (cleanupSecret && safeSecretCompare(providedSecret, cleanupSecret)) {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";

  if (cronSecret && safeSecretCompare(authorization, `Bearer ${cronSecret}`)) {
    return true;
  }

  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // 1. Protect cleanup endpoint
    // -----------------------------------------
    if (!process.env.INVENTORY_CLEANUP_SECRET) {
      console.error("INVENTORY_CLEANUP_SECRET is not configured");

      return jsonResponse(
        {
          message: "Inventory cleanup is not configured",
        },
        500,
      );
    }

    if (!authorized(request)) {
      return jsonResponse(
        {
          message: "Unauthorized",
        },
        401,
      );
    }

    // -----------------------------------------
    // 2. Database
    // -----------------------------------------
    await connectDB();

    const now = new Date();

    // -----------------------------------------
    // 3. Find expired pending reservations
    // -----------------------------------------
    const expiredOrders = await Order.find({
      status: "Pending",
      "inventory.reserved": true,
      "inventory.released": false,
      "inventory.expiresAt": {
        $lt: now,
      },
    })
      .select("_id")
      .sort({
        "inventory.expiresAt": 1,
        _id: 1,
      })
      .limit(BATCH_SIZE)
      .lean();

    let releasedOrders = 0;
    let releasedItems = 0;
    let failedOrders = 0;

    // -----------------------------------------
    // 4. Release expired reservations
    // -----------------------------------------
    for (const order of expiredOrders) {
      try {
        const released = await releaseOrderInventory(order._id.toString());

        if (!released) {
          failedOrders++;
          continue;
        }

        const releasedOrder = await Order.findById(order._id)
          .select("items inventory status")
          .lean();

        if (
          releasedOrder?.status === "Cancelled" &&
          releasedOrder.inventory?.released === true
        ) {
          releasedOrders++;

          for (const item of releasedOrder.items ?? []) {
            if (Number.isInteger(item?.quantity) && item.quantity > 0) {
              releasedItems += item.quantity;
            }
          }
        }
      } catch (releaseError) {
        failedOrders++;

        console.error(
          `INVENTORY CLEANUP FAILED FOR ORDER ${order._id}:`,
          releaseError,
        );
      }
    }

    // -----------------------------------------
    // 5. Result
    // -----------------------------------------
    return jsonResponse({
      message: "Expired inventory cleanup completed",
      releasedOrders,
      releasedItems,
      failedOrders,
      checkedOrders: expiredOrders.length,
      batchSize: BATCH_SIZE,
      hasMore: expiredOrders.length === BATCH_SIZE,
      cleanedAt: now,
    });
  } catch (error) {
    console.error("INVENTORY CLEANUP ERROR:", error);

    return jsonResponse(
      {
        message:
          error instanceof Error ? error.message : "Inventory cleanup failed",
      },
      500,
    );
  }
}
