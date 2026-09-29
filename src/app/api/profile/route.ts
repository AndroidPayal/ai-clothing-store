import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

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
      return jsonResponse({ message: "Unauthorized" }, 401);
    }

    await connectDB();

    const profile = await User.findById(user.id, {
      fullName: 1,
      email: 1,
      role: 1,
    }).lean();

    if (!profile) {
      return jsonResponse({ message: "User not found" }, 404);
    }

    return jsonResponse({
      user: {
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error);

    return jsonResponse({ message: "Failed to fetch profile" }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return jsonResponse({ message: "Unauthorized" }, 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({ message: "Invalid request body" }, 400);
    }

    if (!body || typeof body !== "object") {
      return jsonResponse({ message: "Invalid request body" }, 400);
    }

    const name =
      "name" in body && typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return jsonResponse({ message: "Name is required" }, 400);
    }

    if (name.length < 2) {
      return jsonResponse(
        { message: "Name must be at least 2 characters" },
        400,
      );
    }

    if (name.length > 100) {
      return jsonResponse({ message: "Name is too long" }, 400);
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $set: {
          fullName: name,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("fullName email role");

    if (!updatedUser) {
      return jsonResponse({ message: "User not found" }, 404);
    }

    return jsonResponse({
      message: "Profile updated successfully",
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return jsonResponse({ message: "Failed to update profile" }, 500);
  }
}
