import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";

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

    const wishlist = await Wishlist.findOne({
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        wishlist: wishlist || {
          items: [],
        },
      },
      {
        status: 200,
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
          message: "Invalid wishlist items",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const wishlist = await Wishlist.findOneAndUpdate(
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
        message: "Wishlist updated successfully",
        wishlist,
      },
      {
        status: 200,
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
      },
    );
  }
}
