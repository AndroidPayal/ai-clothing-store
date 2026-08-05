import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const secret = process.env.MOBILE_AUTH_SECRET;

if (!secret) {
  throw new Error("MOBILE_AUTH_SECRET is not defined in environment variables");
}

const secretKey = new TextEncoder().encode(secret);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    const token = authHeader.substring(7);

    const { payload } = await jwtVerify(token, secretKey);

    const userId = payload.sub;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("_id fullName email role");

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
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
          name: user.fullName,
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
    console.error("MOBILE ME ERROR:", error);

    return NextResponse.json(
      {
        message: "Invalid or expired token",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }
}
