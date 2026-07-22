"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

type GuestRouteProps = {
  children: React.ReactNode;
};

export default function GuestRoute({
  children,
}: GuestRouteProps) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Redirecting...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
