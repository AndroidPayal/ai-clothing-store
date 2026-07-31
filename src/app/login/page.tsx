"use client";

import { Suspense, useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import GuestRoute from "@/components/auth/GuestRoute";
import { signIn, getSession } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password.trim(),
        redirect: false,
      });

      if (result?.error) {
        console.log(result.error);

        toast.error("Invalid email or password");

        setIsLoading(false);

        return;
      }

      const session = await getSession();

      console.log("INSIDE LOGIN - ROLE:", session?.user?.role);

      toast.success("Login successful 🎉");

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      toast.error(error instanceof Error ? error.message : "Login failed");

      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
        <div className="w-full rounded-xl border bg-white p-8 text-gray-900 shadow-lg">
          <h1 className="mb-2 text-center text-4xl font-bold">Welcome Back</h1>

          <p className="mb-8 text-center text-gray-500">
            Login to continue shopping
          </p>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
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
              text={isLoading ? "Loading..." : "Login"}
              disabled={isLoading}
              type="submit"
            />
          </form>

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

export default function Login() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[80vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">Loading login...</p>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
