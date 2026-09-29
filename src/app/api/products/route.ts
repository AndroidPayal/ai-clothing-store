import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ALLOWED_CATEGORIES = new Set(["men", "women", "kids"]);

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category")?.trim().toLowerCase();

    if (category && !ALLOWED_CATEGORIES.has(category)) {
      return jsonResponse(
        {
          message: "Invalid product category",
        },
        400,
      );
    }

    const pageParam = searchParams.get("page") ?? "1";

    const limitParam = searchParams.get("limit") ?? String(DEFAULT_LIMIT);

    const page = Number(pageParam);
    const limit = Number(limitParam);

    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      return jsonResponse(
        {
          message: "Invalid page",
        },
        400,
      );
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return jsonResponse(
        {
          message: `Limit must be between 1 and ${MAX_LIMIT}`,
        },
        400,
      );
    }

    const filter = category ? { category } : {};

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .select(
          "id title price inStock thumbnail image category description createdAt updatedAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return jsonResponse({
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("PRODUCTS GET ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to fetch products",
      },
      500,
    );
  }
}
