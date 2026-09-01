"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);

        const response = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setName(data.user.fullName || "");
      } catch (error) {
        console.error("Profile fetch error:", error);

        // Fallback to session name if profile API fails
        setName(session?.user?.name || "");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [status, session?.user?.name]);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      await update({
        name: trimmedName,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[900px] animate-pulse">
          <div className="h-3 w-24 bg-kora/40" />
          <div className="mt-8 h-20 w-72 bg-kora/40" />
          <div className="mt-12 h-48 bg-kora/30" />
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[900px]">
          <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            SOZAN — ACCOUNT
          </p>

          <h1 className="mt-8 font-display text-5xl leading-[0.95] text-thread-black sm:text-6xl">
            Please sign in.
          </h1>

          <Link
            href="/login"
            className="mt-10 inline-flex border border-thread-black px-6 py-4 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:bg-thread-black hover:text-muslin"
          >
            SIGN IN
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="border-b border-kora pb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-grey transition-colors hover:text-awadh-ink"
          >
            <ArrowLeft size={15} strokeWidth={1.25} />
            BACK TO PROFILE
          </Link>

          <p className="mt-10 font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            SOZAN — ACCOUNT
          </p>

          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
            Edit
            <br />
            profile.
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-12">
          <div className="border border-kora bg-kora/20 p-7 sm:p-10">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center border border-thread-black bg-muslin">
              <User size={22} strokeWidth={1.25} />
            </div>

            {/* Name */}
            <div className="mt-10">
              <label
                htmlFor="name"
                className="font-utility text-[9px] tracking-[0.18em] text-thread-grey"
              >
                FULL NAME
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="mt-3 w-full border-b border-thread-grey/40 bg-transparent px-0 py-4 font-editorial text-xl text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-awadh-ink"
              />
            </div>

            {/* Email */}
            <div className="mt-10">
              <label
                htmlFor="email"
                className="font-utility text-[9px] tracking-[0.18em] text-thread-grey"
              >
                EMAIL
              </label>

              <input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="mt-3 w-full border-b border-thread-grey/20 bg-transparent px-0 py-4 font-editorial text-xl text-thread-grey outline-none"
              />

              <p className="mt-3 font-utility text-[8px] tracking-[0.12em] text-thread-grey">
                EMAIL CHANGES ARE CURRENTLY DISABLED
              </p>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={isSaving || isLoadingProfile}
              className="mt-12 flex w-full items-center justify-between border border-thread-black px-5 py-4 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:bg-thread-black hover:text-muslin disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {isLoadingProfile
                  ? "LOADING..."
                  : isSaving
                    ? "SAVING..."
                    : "SAVE CHANGES"}
              </span>
              <Save size={17} strokeWidth={1.25} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
