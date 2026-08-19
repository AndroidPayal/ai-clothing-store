"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Menu,
  Search,
  User,
  LogOut,
  Package,
  LogIn,
  X,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

type NavbarProps = {
  cartCount: number;
  wishlistCount: number;
};

const menuItems = [
  { label: "SHOP ALL", href: "/products" },
  { label: "NEW ARRIVALS", href: "/products?collection=new-arrivals" },
  { label: "WOMEN", href: "/products?category=women" },
  { label: "MEN", href: "/products?category=men" },
];

export default function Navbar({ cartCount, wishlistCount }: NavbarProps) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    setMenuOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Prevent background scrolling while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-kora bg-muslin/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* LEFT */}
          <div className="flex items-center gap-5 lg:gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 text-thread-black transition-opacity hover:opacity-60"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={19} strokeWidth={1.5} />

              <span className="hidden font-utility text-[10px] tracking-[0.18em] sm:inline">
                MENU
              </span>
            </button>

            <Link
              href="/products"
              className={`hidden font-utility text-[10px] tracking-[0.18em] transition-colors md:block ${
                isActive("/products")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              SHOP
            </Link>
          </div>

          {/* CENTER BRAND */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            onClick={() => setMenuOpen(false)}
          >
            <span className="block font-brand text-lg tracking-[0.18em] text-thread-black sm:text-xl">
              SOZAN
            </span>

            <span className="block font-utility text-[8px] tracking-[0.34em] text-thread-grey">
              / NAZM /
            </span>
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* SEARCH */}
            <Link
              href="/products"
              aria-label="Search"
              className="hidden text-thread-black transition-opacity hover:opacity-60 sm:block"
            >
              <Search size={19} strokeWidth={1.5} />
            </Link>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={`relative transition-colors ${
                isActive("/wishlist")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              <Heart size={19} strokeWidth={1.5} />

              {wishlistCount > 0 && (
                <span className="absolute -right-3 -top-2 font-utility text-[9px] text-awadh-ink">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* BAG */}
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className={`relative transition-colors ${
                isActive("/cart")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 font-utility text-[9px] text-awadh-ink">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 border-l border-kora pl-3 sm:pl-5">
                <Link
                  href="/orders"
                  aria-label="My orders"
                  className={`hidden transition-colors md:block ${
                    isActive("/orders")
                      ? "text-awadh-ink"
                      : "text-thread-black hover:text-awadh-ink"
                  }`}
                >
                  <Package size={18} strokeWidth={1.5} />
                </Link>

                <Link
                  href="/orders"
                  aria-label="Account"
                  className="hidden text-thread-black transition-opacity hover:opacity-60 sm:block"
                >
                  <User size={18} strokeWidth={1.5} />
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="hidden text-thread-grey transition-colors hover:text-thread-black md:block"
                >
                  <LogOut size={17} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="border-l border-kora pl-3 font-utility text-[10px] tracking-[0.16em] text-thread-black transition-colors hover:text-awadh-ink sm:pl-5"
              >
                <span className="hidden sm:inline">ACCOUNT</span>
                <LogIn size={18} strokeWidth={1.5} className="sm:hidden" />
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* MENU DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-thread-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <aside className="relative h-full w-full max-w-md bg-muslin px-6 py-6 shadow-2xl sm:px-10">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-kora pb-5">
              <div>
                <p className="font-brand text-lg tracking-[0.18em] text-thread-black">
                  SOZAN
                </p>

                <p className="mt-1 font-utility text-[8px] tracking-[0.3em] text-thread-grey">
                  / NAZM /
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center border border-kora text-thread-black transition-colors hover:bg-thread-black hover:text-muslin"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Navigation */}
            <div className="py-10">
              <p className="mb-6 font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                EXPLORE
              </p>

              <nav className="flex flex-col">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-kora py-5"
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey">
                        0{index + 1}
                      </span>

                      <span className="font-display text-2xl text-thread-black transition-colors group-hover:text-awadh-ink">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Account links */}
            <div className="border-t border-kora pt-6">
              <p className="mb-5 font-utility text-[9px] tracking-[0.22em] text-thread-grey">
                YOUR SPACE
              </p>

              <div className="flex flex-col gap-4">
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 font-utility text-[10px] tracking-[0.16em] text-thread-black"
                >
                  <Heart size={16} strokeWidth={1.5} />
                  WISHLIST
                </Link>

                <Link
                  href={isLoggedIn ? "/orders" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 font-utility text-[10px] tracking-[0.16em] text-thread-black"
                >
                  <User size={16} strokeWidth={1.5} />
                  {isLoggedIn ? "ACCOUNT" : "SIGN IN"}
                </Link>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 font-utility text-[10px] tracking-[0.16em] text-thread-grey"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    LOG OUT
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-6 right-6 border-t border-kora pt-4 sm:left-10 sm:right-10">
              <p className="font-editorial text-sm italic text-thread-grey">
                Dress for the story you{`'`}re about to tell.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
