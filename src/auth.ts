import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "./models/User";
import bcrypt from "bcryptjs";
import connectDB from "./lib/mongodb";

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

        return {
          id: existingUser._id.toString(),
          name: existingUser.fullName,
          email: existingUser.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
