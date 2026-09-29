import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_CART_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;

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

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return jsonResponse(
        {
          message: "Unauthorized",
        },
        401,
      );
    }

    await connectDB();

    const cart = await Cart.findOne({
      userId: user.id,
    }).lean();

    return jsonResponse({
      cart: cart || {
        items: [],
      },
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to fetch cart",
      },
      500,
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return jsonResponse(
        {
          message: "Unauthorized",
        },
        401,
      );
    }

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

    const items =
      "items" in body && Array.isArray(body.items) ? body.items : null;

    if (!items) {
      return jsonResponse(
        {
          message: "Invalid cart items",
        },
        400,
      );
    }

    if (items.length > MAX_CART_ITEMS) {
      return jsonResponse(
        {
          message: `Cart cannot contain more than ${MAX_CART_ITEMS} products`,
        },
        400,
      );
    }

    /*
     * Accept ONLY product IDs and quantities from
     * the client.
     *
     * Product title, price, image, stock, etc.
     * are always rebuilt from MongoDB.
     */
    const normalizedItems = items.map((item: unknown) => {
      if (!item || typeof item !== "object") {
        throw new Error("Invalid cart item");
      }

      const productId = "productId" in item ? Number(item.productId) : NaN;

      const quantity = "quantity" in item ? Number(item.quantity) : NaN;

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_ITEM_QUANTITY
      ) {
        throw new Error("Invalid cart item");
      }

      return {
        productId,
        quantity,
      };
    });

    const productIds = normalizedItems.map((item) => item.productId);

    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length !== productIds.length) {
      return jsonResponse(
        {
          message: "Duplicate products are not allowed",
        },
        400,
      );
    }

    await connectDB();

    /*
     * Verify every product exists.
     */
    const products = await Product.find({
      id: {
        $in: uniqueProductIds,
      },
    })
      .select(
        "id title price inStock stockQuantity thumbnail image category description",
      )
      .lean();

    if (products.length !== uniqueProductIds.length) {
      return jsonResponse(
        {
          message: "One or more products are no longer available",
        },
        400,
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    /*
     * Build the cart using trusted database
     * product information.
     */
    const trustedItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          inStock: product.stockQuantity > 0,
          thumbnail: product.thumbnail,
          image: product.image,
          category: product.category,
          description: product.description,
        },
        quantity: item.quantity,
      };
    });

    const cart = await Cart.findOneAndUpdate(
      {
        userId: user.id,
      },
      {
        $set: {
          userId: user.id,
          items: trustedItems,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return jsonResponse({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to update cart",
      },
      500,
    );
  }
}
