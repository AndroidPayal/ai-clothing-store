"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Admin pages should NOT use the user website shell
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}
