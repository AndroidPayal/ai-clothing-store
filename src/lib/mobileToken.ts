import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/types/next-auth";

const secret = process.env.MOBILE_AUTH_SECRET;

if (!secret) {
  throw new Error("MOBILE_AUTH_SECRET is not defined in environment variables");
}

if (secret.length < 32) {
  throw new Error("MOBILE_AUTH_SECRET must be at least 32 characters long");
}

const secretKey = new TextEncoder().encode(secret);

export async function createMobileToken(user: {
  id: string;
  email: string;
  role: UserRole;
}) {
  return new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyMobileToken(token: string) {
  if (!token?.trim()) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
