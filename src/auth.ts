import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authenticateUser } from "@/lib/authenticateUser";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import type { UserRole } from "@/types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await authenticateUser(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      /*
       * Initial login
       */
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }

      /*
       * Re-check the current role from MongoDB.
       *
       * This prevents an old JWT/session from continuing
       * to have admin privileges after the user's role
       * has been changed or revoked in the database.
       */
      if (token.id) {
        try {
          await connectDB();

          const currentUser = await User.findById(token.id)
            .select("role")
            .lean();

          if (!currentUser) {
            token.id = undefined;
            token.role = "user";
          } else {
            token.role = currentUser.role as UserRole;
          }
        } catch (error) {
          /*
           * Do not silently grant admin privileges if the
           * database cannot be checked.
           */
          console.error("AUTH ROLE REFRESH FAILED:", error);

          token.role = "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";

        session.user.role = (token.role as UserRole) ?? "user";
      }

      return session;
    },
  },
});
