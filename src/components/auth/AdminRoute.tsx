"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("ADMIN ROUTE ROLE:", session?.user?.role);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {" "}
        <p className="text-lg font-medium text-gray-600">
          Checking access...{" "}
        </p>{" "}
      </div>
    );
  }

  if (status === "unauthenticated" || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {" "}
        <p className="text-lg font-medium text-gray-600">
          Redirecting...{" "}
        </p>{" "}
      </div>
    );
  }

  return <>{children}</>;
}
