import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  console.log("1️⃣ SIGNUP API CALLED");
  try {
    const { fullName, email, password } = await request.json();
    console.log("2️⃣ SIGNUP DATA RECEIVED:", {
      fullName,
      email,
    });
    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }
    console.log("3️⃣ CONNECTING TO MONGODB");
    await connectDB();
    console.log("4️⃣ MONGODB CONNECTED");
    console.log("5️⃣ CHECKING EXISTING USER");
    const existingUser = await User.findOne({ email });
    console.log("6️⃣ EXISTING USER:", existingUser ? "FOUND" : "NOT FOUND");
    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        {
          status: 409,
          headers: corsHeaders,
        },
      );
    }
    console.log("7️⃣ HASHING PASSWORD");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("8️⃣ PASSWORD HASHED");
    console.log("9️⃣ CREATING USER IN MONGODB");
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });
    console.log("🔟 USER CREATED:", newUser._id.toString());
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
