"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Package,
  LogOut,
  ArrowUpRight,
  User,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Profile name loaded from MongoDB
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfileName(data.user.fullName || "");
      } catch (error) {
        console.error("Profile fetch error:", error);

        // Fallback to NextAuth session
        setProfileName(session?.user?.name || "");
      }
    };

    loadProfile();
  }, [status, session?.user?.name]);

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    toast.success("Logged out successfully");
    router.push("/");
  };

  // Loading
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="animate-pulse">
            <div className="h-3 w-24 bg-kora/40" />
            <div className="mt-8 h-20 w-72 bg-kora/40" />
            <div className="mt-12 h-40 bg-kora/30" />
          </div>
        </div>
      </main>
    );
  }

  // Not logged in
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-xl border-t border-kora pt-10">
            <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              SOZAN — ACCOUNT
            </p>

            <h1 className="mt-6 font-display text-5xl leading-[0.95] text-thread-black sm:text-6xl">
              Your space
              <br />
              awaits.
            </h1>

            <p className="mt-8 max-w-md font-editorial text-lg leading-relaxed text-thread-grey">
              Sign in to view your account, orders, and saved pieces.
            </p>

            <Link
              href="/login"
              className="mt-10 inline-flex items-center gap-5 border border-thread-black px-6 py-4 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:bg-thread-black hover:text-muslin"
            >
              SIGN IN
              <ArrowUpRight size={16} strokeWidth={1.25} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muslin px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="border-b border-kora pb-8">
          <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            SOZAN — YOUR SPACE
          </p>

          <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                Your
                <br />
                profile.
              </h1>
            </div>

            <p className="max-w-sm font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
              Everything that belongs to your SOZAN journey, gathered in one
              place.
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Identity card */}
          <div className="border border-kora bg-kora/30 p-7 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center border border-thread-black bg-muslin">
              <User size={23} strokeWidth={1.25} />
            </div>

            <p className="mt-8 font-utility text-[8px] tracking-[0.22em] text-thread-grey">
              ACCOUNT
            </p>

            <h2 className="mt-3 font-display text-3xl leading-tight text-thread-black">
              {profileName || "SOZAN Member"}
            </h2>

            <p className="mt-3 break-all font-editorial text-base text-thread-grey">
              {session?.user?.email || "No email available"}
            </p>

            <div className="mt-8 border-t border-thread-grey/30 pt-5">
              <p className="font-utility text-[8px] tracking-[0.16em] text-thread-grey">
                MEMBER
              </p>

              <p className="mt-2 font-editorial text-sm italic text-thread-black">
                Dress for the story you&apos;re about to tell.
              </p>
            </div>
          </div>

          {/* Account actions */}
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                YOUR SPACE
              </span>
            </div>

            {/* Edit Profile */}
            <Link
              href="/profile/edit"
              className="group flex items-center justify-between py-7"
            >
              <div className="flex items-center gap-5">
                <Pencil
                  size={20}
                  strokeWidth={1.25}
                  className="text-thread-grey"
                />

                <div>
                  <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                    01
                  </p>

                  <h3 className="mt-2 font-display text-2xl text-thread-black transition-transform duration-300 group-hover:translate-x-1">
                    Edit profile
                  </h3>
                </div>
              </div>

              <ArrowUpRight
                size={20}
                strokeWidth={1.25}
                className="text-thread-grey transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
              />
            </Link>

            <div className="divide-y divide-kora border-y border-kora">
              {/* Orders */}
              <Link
                href="/orders"
                className="group flex items-center justify-between py-7"
              >
                <div className="flex items-center gap-5">
                  <Package
                    size={20}
                    strokeWidth={1.25}
                    className="text-thread-grey"
                  />

                  <div>
                    <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                      01
                    </p>

                    <h3 className="mt-2 font-display text-2xl text-thread-black transition-transform duration-300 group-hover:translate-x-1">
                      My orders
                    </h3>
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  strokeWidth={1.25}
                  className="text-thread-grey transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
                />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="group flex items-center justify-between py-7"
              >
                <div className="flex items-center gap-5">
                  <Heart
                    size={20}
                    strokeWidth={1.25}
                    className="text-thread-grey"
                  />

                  <div>
                    <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                      02
                    </p>

                    <h3 className="mt-2 font-display text-2xl text-thread-black transition-transform duration-300 group-hover:translate-x-1">
                      Wishlist
                    </h3>
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  strokeWidth={1.25}
                  className="text-thread-grey transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
                />
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full items-center justify-between py-7 text-left"
              >
                <div className="flex items-center gap-5">
                  <LogOut
                    size={20}
                    strokeWidth={1.25}
                    className="text-thread-grey"
                  />

                  <div>
                    <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                      03
                    </p>

                    <h3 className="mt-2 font-display text-2xl text-thread-black transition-transform duration-300 group-hover:translate-x-1">
                      Log out
                    </h3>
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  strokeWidth={1.25}
                  className="text-thread-grey transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="border-t border-kora pt-6">
          <p className="max-w-2xl font-editorial text-xl italic leading-relaxed text-thread-black sm:text-2xl">
            Your wardrobe is personal. Your space should be too.
          </p>
        </div>
      </div>
    </main>
  );
}
