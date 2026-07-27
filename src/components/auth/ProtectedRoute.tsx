"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  // Session is being checked
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // User is not logged in
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  // User is authenticated
  return <>{children}</>;
}
