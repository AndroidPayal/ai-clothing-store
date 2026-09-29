import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const corsOrigin = process.env.MOBILE_APP_ORIGIN || "http://localhost:8081";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({ message: "Invalid request body" }, 400);
    }

    if (!body || typeof body !== "object") {
      return jsonResponse({ message: "Invalid request body" }, 400);
    }

    const fullName =
      "fullName" in body && typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const email =
      "email" in body && typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      "password" in body && typeof body.password === "string"
        ? body.password
        : "";

    if (!fullName || !email || !password) {
      return jsonResponse({ message: "All fields are required" }, 400);
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return jsonResponse({ message: "Please enter a valid name" }, 400);
    }

    if (email.length > 254) {
      return jsonResponse(
        { message: "Please enter a valid email address" },
        400,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return jsonResponse(
        { message: "Please enter a valid email address" },
        400,
      );
    }

    if (password.length < 6) {
      return jsonResponse(
        { message: "Password must be at least 6 characters" },
        400,
      );
    }

    if (password.length > 128) {
      return jsonResponse({ message: "Password is too long" }, 400);
    }

    await connectDB();

    const existingUser = await User.findOne({
      email,
    }).select("_id");

    if (existingUser) {
      return jsonResponse(
        {
          message: "User with this email already exists",
        },
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    /*
     * Never accept a role from the request body.
     *
     * New accounts are created with the User model's
     * default role: "user".
     */
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return jsonResponse(
      {
        message: "User created successfully",
        user: {
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
        },
      },
      201,
    );
  } catch (error: unknown) {
    /*
     * MongoDB unique-index protection.
     *
     * This also handles a race where two signup
     * requests arrive for the same email simultaneously.
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return jsonResponse(
        {
          message: "User with this email already exists",
        },
        409,
      );
    }

    console.error("SIGNUP ERROR:", error);

    return jsonResponse({ message: "Something went wrong" }, 500);
  }
}
