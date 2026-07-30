"use client";

import { useSession } from "next-auth/react";

type GuestRouteProps = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: GuestRouteProps) {
  const { status } = useSession();

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

  // User is not logged in → show Login/Signup page
  return <>{children}</>;
}
