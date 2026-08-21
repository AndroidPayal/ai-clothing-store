"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import GuestRoute from "@/components/auth/GuestRoute";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all the fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup Failed");

      toast.success("Account created successfully 🎉");

      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
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
              ACCOUNT / JOIN
            </span>
          </div>

          {/* Heading */}
          <div className="border-b border-kora pb-8">
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl">
              Create
              <br />
              your account.
            </h1>

            <p className="mt-5 font-editorial text-lg leading-relaxed text-thread-grey">
              Begin your journey through the collection.
            </p>
          </div>

          {/* Form */}
          <div className="mt-10 space-y-6">
            <div>
              <label className="mb-2 block font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                FULL NAME
              </label>

              <input
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border-b border-kora bg-transparent px-0 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/60 focus:border-awadh-ink"
              />
            </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b border-kora bg-transparent px-0 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/60 focus:border-awadh-ink"
              />
            </div>

            <div>
              <label className="mb-2 block font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                CONFIRM PASSWORD
              </label>

              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-b border-kora bg-transparent px-0 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/60 focus:border-awadh-ink"
              />
            </div>

            <div className="pt-4">
              <Button
                text={isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                disabled={isLoading}
                onClick={handleSignup}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-kora pt-6 text-center">
            <p className="font-editorial text-sm text-thread-grey">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-utility text-[9px] tracking-[0.14em] text-thread-black transition-colors hover:text-awadh-ink"
              >
                LOGIN
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  </GuestRoute>
);
}
