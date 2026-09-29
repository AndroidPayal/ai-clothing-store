import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_WISHLIST_ITEMS = 100;

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

    const wishlist = await Wishlist.findOne({
      userId: user.id,
    }).lean();

    return jsonResponse({
      wishlist: wishlist || {
        items: [],
      },
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to fetch wishlist",
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
          message: "Invalid wishlist items",
        },
        400,
      );
    }

    if (items.length > MAX_WISHLIST_ITEMS) {
      return jsonResponse(
        {
          message: `Wishlist cannot contain more than ${MAX_WISHLIST_ITEMS} products`,
        },
        400,
      );
    }

    /*
     * Accept only product IDs from the client.
     *
     * Product title, price, images, stock, etc.
     * are rebuilt from the database.
     */
    const productIds = items.map((item: unknown) => {
      const productId =
        typeof item === "number"
          ? item
          : item && typeof item === "object" && "productId" in item
            ? Number(item.productId)
            : NaN;

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid wishlist product ID");
      }

      return productId;
    });

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
     * Store trusted product snapshots.
     */
    const trustedItems = uniqueProductIds.map((productId) => {
      const product = productMap.get(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        inStock: product.stockQuantity > 0,
        thumbnail: product.thumbnail,
        image: product.image,
        category: product.category,
        description: product.description,
      };
    });

    const wishlist = await Wishlist.findOneAndUpdate(
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
      message: "Wishlist updated successfully",
      wishlist,
    });
  } catch (error) {
    console.error("UPDATE WISHLIST ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to update wishlist",
      },
      500,
    );
  }
}
