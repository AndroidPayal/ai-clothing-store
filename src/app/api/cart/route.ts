import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        cart: cart || {
          items: [],
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch cart",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          message: "Invalid cart items",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const cart = await Cart.findOneAndUpdate(
      {
        userId: session.user.id,
      },
      {
        userId: session.user.id,
        items,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json(
      {
        message: "Cart updated successfully",
        cart,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update cart",
      },
      {
        status: 500,
      },
    );
  }
}
