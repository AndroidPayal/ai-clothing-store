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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const product = await Product.findOne({
      id: productId,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      { product },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Product GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch product" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
