"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import GuestRoute from "@/components/auth/GuestRoute";

export default function Signup() {
  const router = useRouter();
  const {signup} = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <GuestRoute>
          <section className="mx-auto flex min-h-[80vh] max-w-md items-center">

      <div className="w-full text-gray-500 rounded-xl border bg-white p-8 shadow-lg">

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
            className="w-full rounded-lg border p-3"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <Button
            text="Create Account"
            onClick={() => {
              try {

              signup(
                formData.fullName,
                formData.email,
                formData.password
              );

              toast.success("Account created successfully 🎉");

              router.push("/");

              } catch (error) {

              if (error instanceof Error) {
                toast.error(error.message);
              }

              }
            }}
          />

        </div>

      </div>

    </section>
    </GuestRoute>
  );
}