import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { validateProductImageUrl } from "@/lib/imageUrl";

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

async function createProductWithUniqueId(
  productData: ReturnType<typeof validateProductInput>,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const lastProduct = await Product.findOne({})
      .sort({ id: -1 })
      .select("id")
      .lean();

    const nextId =
      typeof lastProduct?.id === "number" &&
      Number.isInteger(lastProduct.id) &&
      lastProduct.id > 0
        ? lastProduct.id + 1
        : 1;

    try {
      return await Product.create({
        id: nextId,
        ...productData,
      });
    } catch (error: unknown) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined;

      if (errorCode !== 11000) {
        throw error;
      }

      if (attempt === 4) {
        throw new Error(
          "Could not generate a unique product ID. Please try again.",
        );
      }
    }
  }

  throw new Error("Could not create product");
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (admin.error) {
      return admin.error;
    }

    await connectDB();

    const products = await Product.find({})
      .select(
        "id title price inStock stockQuantity thumbnail image category description createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return jsonResponse({
      products,
    });
  } catch (error) {
    console.error("ADMIN PRODUCTS GET ERROR:", error);

    return jsonResponse(
      {
        message: "Failed to fetch products",
      },
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (admin.error) {
      return admin.error;
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

    const product = await createProductWithUniqueId(productData);

    return jsonResponse(
      {
        message: "Product created successfully",
        product,
      },
      201,
    );
  } catch (error) {
    console.error("ADMIN PRODUCT POST ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create product";

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
      "Could not generate a unique product ID",
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
