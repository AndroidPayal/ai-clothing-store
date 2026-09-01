import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
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
    const sort = request.nextUrl.searchParams.get("sort");
    const collection = request.nextUrl.searchParams.get("collection");

    // Product categories are stored in lowercase (men, women, kids). Normalize
    // the URL value so category links work regardless of the query's casing.
    const filter = category ? { category: category.toLowerCase() } : {};
    const isNewest = sort === "newest" || collection === "new-arrivals";

    // The existing default is newest-first as well. Keep that ordering for
    // /products, while explicitly applying the same date sort for New Arrivals.
    const products = await Product.find(filter)
      .sort(isNewest ? { createdAt: -1 } : { createdAt: -1 })
      .lean();

    return NextResponse.json(
      { products },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500, headers: corsHeaders },
    );
  }
}
