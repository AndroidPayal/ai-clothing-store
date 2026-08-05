import { SignJWT, jwtVerify } from "jose";

const secret = process.env.MOBILE_AUTH_SECRET;

if (!secret) {
  throw new Error("MOBILE_AUTH_SECRET is not defined in environment variables");
}

const secretKey = new TextEncoder().encode(secret);

export async function createMobileToken(user: {
  id: string;
  email: string;
  role: "user" | "admin";
}) {
  return await new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyMobileToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

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
    role: payload.role,
  };
}
