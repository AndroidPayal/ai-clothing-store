"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import GuestRoute from "@/components/auth/GuestRoute";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const searchParams = useSearchParams(); 

  const redirectPath = searchParams.get("redirect") || "/";
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = () => {
    if (
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      login(
        formData.email.trim(),
        formData.password
      );

      toast.success("Login successful 🎉");

      router.push(redirectPath);

    } catch (error) {

      if (error instanceof Error) {
        toast.error(error.message);
      }

    }
  };

  return (
    <GuestRoute>
          <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">

      <div className="w-full rounded-xl border bg-white p-8 text-gray-900 shadow-lg">

        <h1 className="mb-2 text-center text-4xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Login to continue shopping
        </p>

        <div className="space-y-5">

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              text-gray-900
              placeholder:text-gray-400
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              text-gray-900
              placeholder:text-gray-400
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          <Button
            text="Login"
            onClick={handleLogin}
          />

        </div>

        <p className="mt-6 text-center text-gray-600">
          Don{"'"}t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign up
          </Link>
        </p>

      </div>

    </section>
    </GuestRoute>
  );
}