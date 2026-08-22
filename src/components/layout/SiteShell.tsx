"use client";

import Navbar from "@/components/layout/Navbar";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}