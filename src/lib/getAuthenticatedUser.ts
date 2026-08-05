import { auth } from "@/auth";
import { verifyMobileToken } from "@/lib/mobileToken";

export async function getAuthenticatedUser(request: Request) {
  // 1. Try NextAuth session first
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      source: "web" as const,
    };
  }

  // 2. Try mobile JWT
  const authorization = request.headers.get("Authorization");

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.substring(7);

    try {
      const mobileUser = await verifyMobileToken(token);

      if (mobileUser) {
        return {
          id: mobileUser.id,
          email: mobileUser.email,
          role: mobileUser.role,
          source: "mobile" as const,
        };
      }
    } catch (error) {
      console.error("Mobile token verification error:", error);
    }
  }

  return null;
}
