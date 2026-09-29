import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Prevent an admin from changing their own role.
    if (id === user.id) {
      return NextResponse.json(
        { message: "You cannot change your own role" },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    const role =
      "role" in body && typeof body.role === "string" ? body.role : "";

    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    await connectDB();

    /*
     * Prevent the application from accidentally having
     * zero administrators.
     *
     * If an admin is being demoted, make sure another
     * admin still exists first.
     */
    if (role === "user") {
      const targetUser = await User.findById(id).select("role").lean();

      if (!targetUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      if (targetUser.role === "admin") {
        const adminCount = await User.countDocuments({
          role: "admin",
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              message: "You cannot remove the last administrator",
            },
            { status: 409 },
          );
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          role,
        },
      },
      {
        new: true,
        runValidators: true,
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
    console.error("ADMIN USER ROLE UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update user role" },
      { status: 500 },
    );
  }
}
