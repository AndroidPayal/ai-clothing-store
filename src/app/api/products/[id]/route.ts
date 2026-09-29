import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return jsonResponse(
        {
          message: "Invalid product ID",
        },
        400,
      );
    }

    await connectDB();

    const product = await Product.findOne({
      id: productId,
    })
      .select(
        "id title price inStock stockQuantity thumbnail image category description createdAt updatedAt",
      )
      .lean();

    if (!product) {
      return jsonResponse(
        {
          message: "Product not found",
        },
        404,
      );
    }

    return jsonResponse({
      product,
    });
  } catch (error) {
    console.error("PRODUCT GET ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to fetch product",
      },
      500,
    );
  }
}
