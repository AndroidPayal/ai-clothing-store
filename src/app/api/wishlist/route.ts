import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
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

    const wishlist = await Wishlist.findOne({
      userId: user.id,
    });

    return NextResponse.json(
      {
        wishlist: wishlist || {
          items: [],
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch wishlist",
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
          message: "Invalid wishlist items",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const wishlist = await Wishlist.findOneAndUpdate(
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
        message: "Wishlist updated successfully",
        wishlist,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("UPDATE WISHLIST ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update wishlist",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
