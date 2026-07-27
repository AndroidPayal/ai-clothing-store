"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type GuestRouteProps = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: GuestRouteProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Auth.js is checking the session
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // User is already logged in
  if (status === "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-gray-600">Redirecting...</p>
      </div>
    );
  }

  // User is not logged in → show Login/Signup page
  return <>{children}</>;
}
