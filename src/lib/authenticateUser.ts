import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function authenticateUser(email: string, password: string) {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (!existingUser) {
    return null;
  }

  if (!existingUser.password) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) {
    return null;
  }

  return {
    id: existingUser._id.toString(),
    name: existingUser.fullName,
    email: existingUser.email,
    role: existingUser.role,
  };
}
