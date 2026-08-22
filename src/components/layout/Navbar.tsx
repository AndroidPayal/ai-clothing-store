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
  ArrowUpRight,
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

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];

    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-thread-grey/20 bg-muslin/95 backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* LEFT */}
          <div className="flex items-center gap-6 lg:gap-9">
            {/* MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group flex items-center gap-2 text-thread-black"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu
                size={19}
                strokeWidth={1.35}
                className="transition-transform duration-300 group-hover:rotate-3"
              />

              <span className="hidden font-utility text-[9px] tracking-[0.22em] sm:inline">
                MENU
              </span>
            </button>

            {/* SHOP */}
            <Link
              href="/products"
              className={`hidden font-utility text-[9px] tracking-[0.22em] transition-colors md:block ${
                isActive("/products")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              SHOP
            </Link>
          </div>

          {/* =================================================
              CENTER BRAND
          ================================================= */}

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="absolute left-1/2 -translate-x-1/2 text-center"
          >
            <span className="block font-brand text-[19px] tracking-[0.2em] text-thread-black sm:text-[21px]">
              SOZAN
            </span>

            <span className="mt-0.5 block font-utility text-[7px] tracking-[0.38em] text-thread-grey">
              / NAZM /
            </span>
          </Link>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="flex items-center gap-4 sm:gap-5">
            {/* SEARCH */}
            <Link
              href="/products"
              aria-label="Search"
              className="hidden text-thread-black transition-colors hover:text-awadh-ink sm:block"
            >
              <Search size={18} strokeWidth={1.35} />
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
              <Heart size={19} strokeWidth={1.35} />

              {wishlistCount > 0 && (
                <span className="absolute -right-3 -top-2 min-w-[12px] text-center font-utility text-[8px] text-awadh-ink">
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
              <ShoppingBag size={19} strokeWidth={1.35} />

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 min-w-[12px] text-center font-utility text-[8px] text-awadh-ink">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT */}
            {isLoggedIn ? (
              <div className="flex items-center gap-4 border-l border-thread-grey/25 pl-4 sm:pl-5">
                <Link
                  href="/orders"
                  aria-label="My orders"
                  className={`hidden transition-colors md:block ${
                    isActive("/orders")
                      ? "text-awadh-ink"
                      : "text-thread-black hover:text-awadh-ink"
                  }`}
                >
                  <Package size={17} strokeWidth={1.35} />
                </Link>

                <Link
                  href="/orders"
                  aria-label="Account"
                  className="hidden text-thread-black transition-colors hover:text-awadh-ink sm:block"
                >
                  <User size={18} strokeWidth={1.35} />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="hidden text-thread-grey transition-colors hover:text-thread-black md:block"
                >
                  <LogOut size={16} strokeWidth={1.35} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center border-l border-thread-grey/25 pl-4 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink sm:pl-5"
              >
                <span className="hidden sm:inline">ACCOUNT</span>

                <LogIn size={18} strokeWidth={1.35} className="sm:hidden" />
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* =====================================================
          MENU DRAWER
      ===================================================== */}

      {menuOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-thread-black/25 backdrop-blur-[2px]"
          />

          {/* DRAWER */}
          <aside className="relative flex h-full w-full max-w-[460px] flex-col bg-muslin px-6 py-6 shadow-2xl sm:px-10">
            {/* DRAWER HEADER */}
            <div className="flex items-start justify-between border-b border-thread-grey/25 pb-6">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <p className="font-brand text-lg tracking-[0.2em] text-thread-black">
                  SOZAN
                </p>

                <p className="mt-1 font-utility text-[7px] tracking-[0.35em] text-thread-grey">
                  / NAZM /
                </p>
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center border border-thread-grey/30 text-thread-black transition-all duration-300 hover:bg-thread-black hover:text-muslin"
              >
                <X size={17} strokeWidth={1.35} />
              </button>
            </div>

            {/* NAVIGATION */}
            <div className="flex-1 py-10">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-8 bg-awadh-ink" />

                <p className="font-utility text-[9px] tracking-[0.24em] text-awadh-ink">
                  EXPLORE
                </p>
              </div>

              <nav className="flex flex-col">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-thread-grey/20 py-5"
                  >
                    <div className="flex items-center gap-6">
                      <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
                        0{index + 1}
                      </span>

                      <span className="font-display text-[28px] leading-none text-thread-black transition-transform duration-500 group-hover:translate-x-2">
                        {item.label}
                      </span>
                    </div>

                    <ArrowUpRight
                      size={19}
                      strokeWidth={1.25}
                      className="text-thread-grey transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
                    />
                  </Link>
                ))}
              </nav>
            </div>

            {/* ACCOUNT */}
            <div className="border-t border-thread-grey/20 pt-7">
              <p className="mb-5 font-utility text-[8px] tracking-[0.24em] text-thread-grey">
                YOUR SPACE
              </p>

              <div className="flex flex-wrap gap-x-7 gap-y-5">
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
                >
                  <Heart size={15} strokeWidth={1.35} />
                  WISHLIST
                </Link>

                <Link
                  href={isLoggedIn ? "/orders" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
                >
                  <User size={15} strokeWidth={1.35} />
                  {isLoggedIn ? "ACCOUNT" : "SIGN IN"}
                </Link>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-grey transition-colors hover:text-thread-black"
                  >
                    <LogOut size={15} strokeWidth={1.35} />
                    LOG OUT
                  </button>
                )}
              </div>
            </div>

            {/* DRAWER FOOTER */}
            <div className="mt-8 border-t border-thread-grey/20 pt-5">
              <p className="max-w-xs font-editorial text-sm italic leading-relaxed text-thread-grey">
                Dress for the story you&apos;re about to tell.
              </p>

              <p className="mt-4 font-utility text-[7px] tracking-[0.24em] text-thread-grey/60">
                SOZAN / NAZM
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
