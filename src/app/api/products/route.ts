import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const category = request.nextUrl.searchParams.get("category")?.trim();

    const filter = category ? { category: category.toLowerCase() } : {};

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { products },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
