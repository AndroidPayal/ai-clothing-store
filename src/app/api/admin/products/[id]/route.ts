import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { validateProductImageUrl } from "@/lib/imageUrl";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_CATEGORIES = new Set(["men", "women", "kids"]);

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
  });
}

function validateProductInput(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const data = body as Record<string, unknown>;

  const title = typeof data.title === "string" ? data.title.trim() : "";

  const thumbnail =
    typeof data.thumbnail === "string" ? data.thumbnail.trim() : "";

  const image = typeof data.image === "string" ? data.image.trim() : "";

  const category =
    typeof data.category === "string" ? data.category.trim().toLowerCase() : "";

  const description =
    typeof data.description === "string" ? data.description.trim() : "";

  const price = Number(data.price);

  const stockQuantity = Number(data.stockQuantity);

  if (!title || !thumbnail || !image || !category || !description) {
    throw new Error("All product fields are required");
  }

  if (title.length < 2 || title.length > 150) {
    throw new Error("Product title must be between 2 and 150 characters");
  }

  if (description.length > 2000) {
    throw new Error("Product description is too long");
  }

  if (!Number.isFinite(price) || price <= 0 || price > 100000000) {
    throw new Error("Invalid product price");
  }

  if (
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0 ||
    stockQuantity > 1000000
  ) {
    throw new Error(
      "Stock quantity must be a whole number between 0 and 1000000",
    );
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error("Invalid product category");
  }

  validateProductImageUrl(thumbnail, "thumbnail");
  validateProductImageUrl(image, "image");

  return {
    title,
    price,
    stockQuantity,
    inStock: stockQuantity > 0,
    thumbnail,
    image,
    category,
    description,
  };
}

async function requireAdmin(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user?.id) {
    return {
      error: jsonResponse({ message: "Unauthorized" }, 401),
    };
  }

  if (user.role !== "admin") {
    return {
      error: jsonResponse({ message: "Forbidden" }, 403),
    };
  }

  return {
    user,
  };
}
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    if (admin.error) {
      return admin.error;
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonResponse(
        {
          message: "Invalid product ID",
        },
        400,
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

    const productData = validateProductInput(body);

    await connectDB();

    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
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
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("ADMIN PRODUCT PATCH ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update product";

    const clientErrorMessages = [
      "Invalid request body",
      "All product fields are required",
      "Product title",
      "Product description",
      "Invalid product price",
      "Stock quantity",
      "Invalid product category",
      "Invalid thumbnail URL",
      "Invalid image URL",
    ];

    const isClientError = clientErrorMessages.some((item) =>
      message.includes(item),
    );

    return jsonResponse(
      {
        message,
      },
      isClientError ? 400 : 500,
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(_request);

    if (admin.error) {
      return admin.error;
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonResponse(
        {
          message: "Invalid product ID",
        },
        400,
      );
    }

    await connectDB();

    const product = await Product.findById(id)
      .select("id title stockQuantity")
      .lean();

    if (!product) {
      return jsonResponse(
        {
          message: "Product not found",
        },
        404,
      );
    }

    /*
     * IMPORTANT:
     *
     * Do not physically delete a product while an
     * active Pending order still references it.
     *
     * Those orders may need the product during
     * inventory-release/reconciliation.
     */
    const activeReservation = await Order.findOne({
      status: "Pending",
      "inventory.reserved": true,
      "inventory.released": false,
      "items.product.id": product.id,
    })
      .select("_id")
      .lean();

    if (activeReservation) {
      return jsonResponse(
        {
          message:
            "This product cannot be deleted while it has an active pending order reservation. Wait for payment completion or inventory cleanup.",
        },
        409,
      );
    }

    /*
     * Prevent deleting a product that still has
     * historical orders.
     *
     * Orders contain a snapshot of the product, so
     * they remain readable, but keeping the product
     * record is safer for administration/reporting.
     */
    const orderReference = await Order.findOne({
      "items.product.id": product.id,
    })
      .select("_id")
      .lean();

    if (orderReference) {
      return jsonResponse(
        {
          message:
            "This product has order history and cannot be deleted. Set its stock to 0 instead.",
        },
        409,
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return jsonResponse(
        {
          message: "Product not found",
        },
        404,
      );
    }

    return jsonResponse({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN PRODUCT DELETE ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to delete product",
      },
      500,
    );
  }
}
