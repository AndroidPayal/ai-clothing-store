import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyMobileToken } from "@/lib/mobileToken";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { message },
    {
      status: 401,
      headers: corsHeaders,
    },
  );
}

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
      return unauthorized();
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return unauthorized();
    }

    const mobileUser = await verifyMobileToken(token);

    if (!mobileUser) {
      return unauthorized("Invalid or expired token");
    }

    await connectDB();

    // Always read the current user and role from MongoDB.
    // This prevents an old JWT from retaining a role after the
    // user's account/role has changed.
    const user = await User.findById(mobileUser.id).select(
      "_id fullName email role",
    );

    if (!user) {
      return unauthorized("Invalid or expired token");
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

    return unauthorized("Invalid or expired token");
  }
}
