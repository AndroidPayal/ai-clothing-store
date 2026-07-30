import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "./models/User";
import bcrypt from "bcryptjs";
import connectDB from "./lib/mongodb";
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
        await connectDB();
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) {
          return null;
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) return null;

        if (!existingUser.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          password,
          existingUser.password,
        );

        if (!passwordMatch) return null;
        console.log("AUTH USER:", {
          id: existingUser._id.toString(),
          name: existingUser.fullName,
          email: existingUser.email,
          role: existingUser.role,
        });
        return {
          id: existingUser._id.toString(),
          name: existingUser.fullName,
          email: existingUser.email,
          role: existingUser.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }

      console.log("JWT ROLE:", token.role);

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as UserRole) ?? "user";
      }

      console.log("SESSION ROLE:", session.user.role);

      return session;
    },
  },
});
