import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const secret = process.env.MOBILE_AUTH_SECRET;

if (!secret) {
  throw new Error("MOBILE_AUTH_SECRET is not defined in environment variables");
}

const secretKey = new TextEncoder().encode(secret);

async function getMobileUser(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  const { payload } = await jwtVerify(token, secretKey);

  if (!payload.sub) {
    return null;
  }

  return payload.sub;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const userId = await getMobileUser(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const user = await User.findById(userId)
      .select("_id fullName email role")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("MOBILE PROFILE GET ERROR:", error);

    return NextResponse.json(
      { message: "Invalid or expired token" },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getMobileUser(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Name is too long" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        fullName: name,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("_id fullName email role")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("MOBILE PROFILE PATCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update profile" },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
