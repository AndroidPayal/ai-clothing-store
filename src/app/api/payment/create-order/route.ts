import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { buildTrustedOrderData, validateCustomer } from "@/lib/checkout";
import { reserveOrderInventory } from "@/lib/reserveOrderInventory";
import { releaseOrderInventory } from "@/lib/releaseOrderInventory";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Idempotency-Key",
};

const INVENTORY_RESERVATION_MINUTES = 15;

const MAX_ACTIVE_RESERVATIONS = Number(
  process.env.MAX_ACTIVE_RESERVATIONS_PER_USER || 3,
);

const MAX_CHECKOUTS_PER_MINUTE = Number(
  process.env.MAX_CHECKOUTS_PER_MINUTE || 6,
);

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  let pendingOrderId = "";
  let razorpayOrderId = "";

  try {
    // -----------------------------------------
    // 1. Razorpay configuration
    // -----------------------------------------
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("RAZORPAY ENVIRONMENT VARIABLES ARE MISSING");

      return jsonResponse(
        {
          message: "Payment service is not configured",
        },
        500,
      );
    }

    // -----------------------------------------
    // 2. Authentication
    // -----------------------------------------
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return jsonResponse(
        {
          message: "Unauthorized",
        },
        401,
      );
    }

    // -----------------------------------------
    // 3. Idempotency key
    // -----------------------------------------
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || "";

    if (idempotencyKey.length < 16 || idempotencyKey.length > 128) {
      return jsonResponse(
        {
          message: "A valid Idempotency-Key is required for checkout",
        },
        400,
      );
    }

    await connectDB();

    // -----------------------------------------
    // 4. Return existing completed/pending checkout
    // -----------------------------------------
    const existingOrder = await Order.findOne({
      userId: user.id,
      checkoutIdempotencyKey: idempotencyKey,
    })
      .select("+checkoutFingerprint")
      .lean();

    if (existingOrder) {
      /*
       * A repeated key is only valid for the same
       * normalized checkout.
       */
      let retryBody: unknown;

      try {
        retryBody = await request.clone().json();
      } catch {
        retryBody = null;
      }

      if (!retryBody || typeof retryBody !== "object") {
        return jsonResponse(
          {
            message: "Invalid request body",
          },
          400,
        );
      }

      const retryCustomer = validateCustomer(
        "customer" in retryBody
          ? (retryBody.customer as never)
          : (undefined as never),
      );

      const retryData = await buildTrustedOrderData(
        "items" in retryBody ? (retryBody.items as never) : [],
      );

      const retryFingerprint = crypto
        .createHash("sha256")
        .update(
          JSON.stringify({
            items: retryData.items.map((item) => ({
              id: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
            customer: retryCustomer,
            total: retryData.total,
          }),
        )
        .digest("hex");

      if (
        existingOrder.checkoutFingerprint &&
        existingOrder.checkoutFingerprint !== retryFingerprint
      ) {
        return jsonResponse(
          {
            message:
              "Idempotency-Key was already used for a different checkout",
          },
          409,
        );
      }

      const existingReservationActive =
        existingOrder.status === "Pending" &&
        existingOrder.inventory?.reserved === true &&
        existingOrder.inventory?.released !== true &&
        !!existingOrder.inventory?.expiresAt &&
        new Date(existingOrder.inventory.expiresAt).getTime() > Date.now();

      if (existingOrder.payment?.razorpayOrderId && existingReservationActive) {
        return jsonResponse({
          order: {
            id: existingOrder.payment.razorpayOrderId,
            amount: Math.round(existingOrder.total * 100),
            currency: "INR",
          },
          internalOrderId: existingOrder._id.toString(),
          inventoryReservation: {
            expiresAt: existingOrder.inventory.expiresAt,
          },
          reused: true,
        });
      }

      return jsonResponse(
        {
          message:
            "This checkout is already being processed. Please retry shortly.",
        },
        409,
      );
    }

    // -----------------------------------------
    // 5. Parse request
    // -----------------------------------------
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          message: "Invalid request body",
        },
        400,
      );
    }

    if (!body || typeof body !== "object") {
      return jsonResponse(
        {
          message: "Invalid request body",
        },
        400,
      );
    }

    // -----------------------------------------
    // 6. Validate customer
    // -----------------------------------------
    const trustedCustomer = validateCustomer(
      "customer" in body ? (body.customer as never) : (undefined as never),
    );

    // -----------------------------------------
    // 7. Validate cart
    // -----------------------------------------
    if (
      !("items" in body) ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return jsonResponse(
        {
          message: "Your cart is empty",
        },
        400,
      );
    }

    // -----------------------------------------
    // 8. Build trusted order data
    // -----------------------------------------
    const { items, total } = await buildTrustedOrderData(body.items as never);

    const checkoutFingerprint = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          customer: trustedCustomer,
          total,
        }),
      )
      .digest("hex");

    if (!Array.isArray(items) || items.length === 0) {
      return jsonResponse(
        {
          message: "No valid products found in your cart",
        },
        400,
      );
    }

    if (!Number.isFinite(total) || total <= 0) {
      return jsonResponse(
        {
          message: "Invalid order total",
        },
        400,
      );
    }

    const amountInPaise = Math.round(total * 100);

    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return jsonResponse(
        {
          message: "Invalid payment amount",
        },
        400,
      );
    }

    /*
     * Existing idempotent requests are returned above.
     * These limits apply only to genuinely new checkouts.
     */
    const minuteAgo = new Date(Date.now() - 60_000);

    const [activeReservations, recentCheckouts] = await Promise.all([
      Order.countDocuments({
        userId: user.id,
        status: "Pending",
        "inventory.reserved": true,
        "inventory.released": false,
      }),

      Order.countDocuments({
        userId: user.id,
        createdAt: {
          $gte: minuteAgo,
        },
      }),
    ]);

    if (
      activeReservations >= MAX_ACTIVE_RESERVATIONS ||
      recentCheckouts >= MAX_CHECKOUTS_PER_MINUTE
    ) {
      return jsonResponse(
        {
          message:
            "Too many active checkout attempts. Please wait for an existing checkout to finish.",
        },
        429,
      );
    }

    // -----------------------------------------
    // 9. Reserve inventory + create order
    //    in ONE MongoDB transaction
    // -----------------------------------------
    const reservedAt = new Date();

    const expiresAt = new Date(
      reservedAt.getTime() + INVENTORY_RESERVATION_MINUTES * 60 * 1000,
    );

    let claimedOrder;

    try {
      claimedOrder = await reserveOrderInventory({
        userId: user.id,
        checkoutIdempotencyKey: idempotencyKey,
        checkoutFingerprint,

        items,

        total,

        customer: trustedCustomer,

        payment: {
          razorpayOrderId: "",
          razorpayPaymentId: "",
          razorpaySignature: "",
        },

        inventory: {
          reserved: true,
          released: false,
          reservedAt,
          expiresAt,
        },

        status: "Pending",
      });
    } catch (error: unknown) {
      /*
       * Another concurrent request may have won the
       * unique checkout idempotency key.
       */
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        const concurrentOrder = await Order.findOne({
          userId: user.id,
          checkoutIdempotencyKey: idempotencyKey,
        }).lean();

        const concurrentReservationActive =
          concurrentOrder?.status === "Pending" &&
          concurrentOrder.inventory?.reserved === true &&
          concurrentOrder.inventory?.released !== true &&
          !!concurrentOrder.inventory?.expiresAt &&
          new Date(concurrentOrder.inventory.expiresAt).getTime() > Date.now();

        if (
          concurrentOrder?.payment?.razorpayOrderId &&
          concurrentReservationActive
        ) {
          return jsonResponse({
            order: {
              id: concurrentOrder.payment.razorpayOrderId,
              amount: Math.round(concurrentOrder.total * 100),
              currency: "INR",
            },
            internalOrderId: concurrentOrder._id.toString(),
            inventoryReservation: {
              expiresAt: concurrentOrder.inventory.expiresAt,
            },
            reused: true,
          });
        }

        return jsonResponse(
          {
            message:
              "This checkout is already being processed. Please retry shortly.",
          },
          409,
        );
      }

      throw error;
    }

    pendingOrderId = claimedOrder._id.toString();

    // -----------------------------------------
    // 10. Create Razorpay order
    // -----------------------------------------
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Date.now()}_${user.id.slice(-12)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
    });

    razorpayOrderId = razorpayOrder.id;

    // -----------------------------------------
    // 11. Save Razorpay order ID
    // -----------------------------------------
    const saveResult = await Order.updateOne(
      {
        _id: claimedOrder._id,
        userId: user.id,
        checkoutIdempotencyKey: idempotencyKey,
        status: "Pending",
        "inventory.reserved": true,
        "inventory.released": false,
        "payment.razorpayOrderId": "",
      },
      {
        $set: {
          "payment.razorpayOrderId": razorpayOrder.id,
        },
      },
    );

    /*
     * If the order could not be updated, do not silently
     * return a Razorpay order that is no longer linked to
     * our internal order.
     */
    if (saveResult.modifiedCount !== 1) {
      console.error("FAILED TO LINK RAZORPAY ORDER TO INTERNAL ORDER:", {
        internalOrderId: pendingOrderId,
        razorpayOrderId,
      });

      throw new Error(
        "Payment order was created but could not be linked to the checkout",
      );
    }

    // -----------------------------------------
    // 12. Success
    // -----------------------------------------
    return jsonResponse({
      order: razorpayOrder,
      internalOrderId: claimedOrder._id.toString(),
      inventoryReservation: {
        expiresAt,
      },
      reused: false,
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);

    // -----------------------------------------
    // 13. Release committed inventory
    // -----------------------------------------
    if (pendingOrderId) {
      try {
        /*
         * reserveOrderInventory() already committed the
         * stock deduction. Therefore the only safe rollback
         * is through the transactional release function.
         */
        const released = await releaseOrderInventory(pendingOrderId);

        if (!released) {
          /*
           * IMPORTANT:
           * Do NOT delete the order if inventory release
           * failed. The order remains available for recovery.
           */
          console.error("INVENTORY RELEASE DID NOT COMPLETE:", pendingOrderId);
        } else {
          /*
           * Only remove the checkout claim when:
           * - the inventory was successfully restored
           * - the order has no linked Razorpay order
           *
           * If a Razorpay order already exists, preserve the
           * cancelled order so it can be reconciled manually.
           */
          if (!razorpayOrderId) {
            try {
              await Order.deleteOne({
                _id: pendingOrderId,
                status: "Cancelled",
                "inventory.reserved": false,
                "inventory.released": true,
                "payment.razorpayOrderId": "",
              });
            } catch (deleteError) {
              console.error(
                "FAILED TO REMOVE FAILED CHECKOUT CLAIM:",
                deleteError,
              );
            }
          }
        }
      } catch (releaseError) {
        console.error("FAILED TO RELEASE CHECKOUT INVENTORY:", releaseError);
      }
    }

    // -----------------------------------------
    // 14. Razorpay orphan reconciliation
    // -----------------------------------------
    if (razorpayOrderId) {
      console.error(
        "ORPHAN RAZORPAY ORDER REQUIRES RECONCILIATION:",
        razorpayOrderId,
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create payment order";

    const isClientError =
      message === "Invalid request body" ||
      message === "Your cart is empty" ||
      message === "Invalid order total" ||
      message === "Invalid payment amount" ||
      message.includes("no longer available") ||
      message.includes("currently out of stock") ||
      message.includes("Invalid cart items") ||
      message.includes("Duplicate products") ||
      message.includes("Shipping details") ||
      message.includes("Please provide");

    return jsonResponse(
      {
        message,
      },
      isClientError ? 400 : 500,
    );
  }
}
