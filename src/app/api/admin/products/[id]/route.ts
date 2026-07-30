import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    const { title, price, inStock, thumbnail, image, category, description } =
      body;

    if (
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

    const product = await Product.findByIdAndUpdate(
      id,
      {
        title,
        price,
        inStock,
        thumbnail,
        image,
        category,
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Product updated successfully",
        product,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin product PATCH error:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin product DELETE error:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
