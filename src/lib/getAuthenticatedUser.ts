import { auth } from "@/auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyMobileToken } from "@/lib/mobileToken";
import type { UserRole } from "@/types/next-auth";

export async function getAuthenticatedUser(request: Request) {
  let userId = "";
  let email: string | undefined;
  let source: "web" | "mobile" = "web";

  // --------------------------------------------------
  // 1. Try NextAuth session
  // --------------------------------------------------
  const session = await auth();

  if (session?.user?.id) {
    userId = session.user.id;
    email = session.user.email ?? undefined;
    source = "web";
  }

  // --------------------------------------------------
  // 2. Try mobile JWT
  // --------------------------------------------------
  if (!userId) {
    const authorization = request.headers.get("Authorization");

    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.substring(7).trim();

      if (token) {
        try {
          const mobileUser = await verifyMobileToken(token);

          if (mobileUser?.id) {
            userId = mobileUser.id;
            email = mobileUser.email;
            source = "mobile";
          }
        } catch (error) {
          console.error("Mobile token verification error:", error);
        }
      }
    }
  }

  if (!userId) {
    return null;
  }

  // --------------------------------------------------
  // 3. Always load CURRENT user from database
  // --------------------------------------------------
  try {
    await connectDB();

    const currentUser = await User.findById(userId)
      .select("_id email role")
      .lean();

    if (!currentUser) {
      return null;
    }

    return {
      id: currentUser._id.toString(),
      email: currentUser.email ?? email,
      role: currentUser.role as UserRole,
      source,
    };
  } catch (error) {
    /*
     * Never fall back to a cached JWT/session role when
     * the database check fails.
     *
     * This prevents stale admin privileges from being
     * accidentally granted during a database failure.
     */
    console.error("CURRENT USER ROLE LOOKUP FAILED:", error);

    return null;
  }
}
