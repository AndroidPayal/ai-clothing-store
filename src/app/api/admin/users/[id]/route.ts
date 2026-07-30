import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from changing their own role
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "You cannot change your own role" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { role } = body;

    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      {
        new: true,
      },
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User role updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin user role update error:", error);

    return NextResponse.json(
      { message: "Failed to update user role" },
      { status: 500 },
    );
  }
}
