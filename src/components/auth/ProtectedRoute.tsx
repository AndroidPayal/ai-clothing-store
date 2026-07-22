"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { isLoggedIn } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [isLoggedIn, pathname, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
