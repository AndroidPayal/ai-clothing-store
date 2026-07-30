import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Admin products GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const {
      id,
      title,
      price,
      inStock,
      thumbnail,
      image,
      category,
      description,
    } = body;

    if (
      id === undefined ||
      !title ||
      price === undefined ||
      !thumbnail ||
      !image ||
      !category ||
      !description
    ) {
      return NextResponse.json(
        { message: "All product fields are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existingProduct = await Product.findOne({ id });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Product ID already exists" },
        { status: 400 },
      );
    }

    const product = await Product.create({
      id,
      title,
      price,
      inStock,
      thumbnail,
      image,
      category,
      description,
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin product POST error:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
