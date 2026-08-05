import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const cart = await Cart.findOne({
      userId: user.id,
    });

    return NextResponse.json(
      {
        cart: cart || {
          items: [],
        },
      },
      {
        status: 200,
        headers: corsHeaders,
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
        headers: corsHeaders,
      },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
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
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const cart = await Cart.findOneAndUpdate(
      {
        userId: user.id,
      },
      {
        userId: user.id,
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
        headers: corsHeaders,
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
        headers: corsHeaders,
      },
    );
  }
}
