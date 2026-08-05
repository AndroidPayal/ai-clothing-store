"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import GuestRoute from "@/components/auth/GuestRoute";

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
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-xl border bg-white p-8 text-gray-900 shadow-lg">
          <h1 className="mb-2 text-center text-4xl font-bold">
            Create Account
          </h1>

          <p className="mb-8 text-center text-gray-500">
            Join AI Clothing Store
          </p>

          <div className="space-y-5">
            <input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500"
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500"
            />

            <Button
              text={isLoading ? "Creating Account..." : "Create Account"}
              disabled={isLoading}
              onClick={handleSignup}
            />
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}
