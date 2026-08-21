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
    <main className="min-h-[calc(100vh-72px)] bg-muslin">
      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px] items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          {/* Editorial label */}
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-awadh-ink" />

            <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              ACCOUNT / SIGN IN
            </span>
          </div>

          {/* Heading */}
          <div className="border-b border-kora pb-8">
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl">
              Welcome
              <br />
              back.
            </h1>

            <p className="mt-5 font-editorial text-lg leading-relaxed text-thread-grey">
              Login to continue your journey through the collection.
            </p>
          </div>

          {/* Form */}
          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div>
              <label className="mb-2 block font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                EMAIL
              </label>

              <input
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b border-kora bg-transparent px-0 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/60 focus:border-awadh-ink"
              />
            </div>

            <div>
              <label className="mb-2 block font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                PASSWORD
              </label>

              <input
                name="password"
                type="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b border-kora bg-transparent px-0 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/60 focus:border-awadh-ink"
              />
            </div>

            <div className="pt-4">
              <Button
                text={isLoading ? "LOADING..." : "LOGIN"}
                disabled={isLoading}
                type="submit"
              />
            </div>
          </form>

          <div className="mt-8 border-t border-kora pt-6 text-center">
            <p className="font-editorial text-sm text-thread-grey">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-utility text-[9px] tracking-[0.14em] text-thread-black transition-colors hover:text-awadh-ink"
              >
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
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
