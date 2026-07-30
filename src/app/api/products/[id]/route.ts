import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    await connectDB();

    const product = await Product.findOne({
      id: Number(id),
    }).lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Product GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
