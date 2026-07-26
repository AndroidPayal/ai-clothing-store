import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(
  request: Request
) {
  try {
    const {
      fullName,
      email,
      password,
    } = await request.json();

    // Validate fields
    if (
      !fullName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check existing user
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "User with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // Create user
    const newUser =
      await User.create({
        fullName,
        email,
        password:
          hashedPassword,
      });

    return NextResponse.json(
      {
        message:
          "User created successfully",
        user: {
          id: newUser._id,
          fullName:
            newUser.fullName,
          email:
            newUser.email,
        },
      },
      {
        status: 201,
      }
    );

  } catch (error) {
  console.error("Signup error:", error);

  return NextResponse.json(
    {
      message: "Something went wrong",
      error: error instanceof Error
        ? error.message
        : String(error),
    },
    {
      status: 500,
    }
  
    );
  }
}
