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
  House,
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
  { label: "KIDS", href: "/products?category=kids" },
];

export default function Navbar({ cartCount, wishlistCount }: NavbarProps) {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";

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
        <nav
          aria-label="Main navigation"
          className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center px-3 sm:h-[72px] sm:px-6 lg:px-10 xl:px-12"
        >
          {/* LEFT */}
          <div className="flex flex-1 items-center justify-start">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group flex min-h-11 min-w-11 items-center justify-start gap-2 text-thread-black"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
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
          </div>

          {/* CENTER BRAND */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            aria-label="SOZAN NAZM Home"
            className="relative z-10 shrink-0 px-3 text-center sm:px-4"
          >
            <span className="block whitespace-nowrap font-brand text-[17px] tracking-[0.16em] text-thread-black xs:text-[19px] sm:text-[21px] sm:tracking-[0.2em]">
              SOZAN
            </span>

            <span className="mt-0.5 block whitespace-nowrap font-utility text-[6px] tracking-[0.3em] text-thread-grey sm:text-[7px] sm:tracking-[0.38em]">
              / NAZM /
            </span>
          </Link>

          {/* RIGHT ACTIONS */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-0 sm:gap-1 md:gap-2 lg:gap-3 xl:gap-4">
            {/* HOME */}
            <Link
              href="/"
              aria-label="Home"
              className={`flex h-11 w-9 shrink-0 items-center justify-center transition-colors sm:w-10 ${
                pathname === "/"
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              <House size={18} strokeWidth={1.35} />
            </Link>

            {/* SEARCH */}
            <Link
              href="/products"
              aria-label="Search products"
              className="hidden h-11 w-9 shrink-0 items-center justify-center text-thread-black transition-colors hover:text-awadh-ink sm:flex sm:w-10"
            >
              <Search size={18} strokeWidth={1.35} />
            </Link>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist${
                wishlistCount > 0 ? `, ${wishlistCount} items` : ""
              }`}
              className={`relative flex h-11 w-9 shrink-0 items-center justify-center transition-colors sm:w-10 ${
                isActive("/wishlist")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              <Heart size={19} strokeWidth={1.35} />

              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 min-w-[14px] text-center font-utility text-[8px] leading-none text-awadh-ink">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* BAG */}
            <Link
              href="/cart"
              aria-label={`Shopping bag${
                cartCount > 0 ? `, ${cartCount} items` : ""
              }`}
              className={`relative flex h-11 w-9 shrink-0 items-center justify-center transition-colors sm:w-10 ${
                isActive("/cart")
                  ? "text-awadh-ink"
                  : "text-thread-black hover:text-awadh-ink"
              }`}
            >
              <ShoppingBag size={19} strokeWidth={1.35} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 min-w-[14px] text-center font-utility text-[8px] leading-none text-awadh-ink">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT */}
            {isLoggedIn ? (
              <div className="flex shrink-0 items-center border-l border-thread-grey/25 pl-0.5 sm:gap-0.5 sm:pl-1.5 md:gap-1.5 md:pl-2.5 lg:gap-2">
                {/* ADMIN */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    aria-label="Admin Dashboard"
                    className="hidden min-h-11 shrink-0 items-center px-1 font-utility text-[8px] tracking-[0.12em] text-awadh-ink transition-colors hover:text-thread-black xl:flex"
                  >
                    ADMIN
                  </Link>
                )}

                {/* ORDERS */}
                <Link
                  href="/orders"
                  aria-label="My orders"
                  className={`hidden h-11 w-9 items-center justify-center transition-colors md:flex sm:w-10 ${
                    isActive("/orders")
                      ? "text-awadh-ink"
                      : "text-thread-black hover:text-awadh-ink"
                  }`}
                >
                  <Package size={17} strokeWidth={1.35} />
                </Link>

                {/* PROFILE */}
                <Link
                  href="/profile"
                  aria-label="Account"
                  className={`hidden h-11 w-9 items-center justify-center transition-colors sm:flex sm:w-10 ${
                    isActive("/profile")
                      ? "text-awadh-ink"
                      : "text-thread-black hover:text-awadh-ink"
                  }`}
                >
                  <User size={18} strokeWidth={1.35} />
                </Link>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="hidden h-11 w-9 items-center justify-center text-thread-grey transition-colors hover:text-thread-black md:flex sm:w-10"
                >
                  <LogOut size={16} strokeWidth={1.35} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Account"
                className="flex h-11 min-w-10 shrink-0 items-center justify-center border-l border-thread-grey/25 pl-1 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink sm:pl-3"
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
          <aside
            id="site-menu"
            aria-label="Site menu"
            className="relative flex h-full w-[min(100%,460px)] flex-col overflow-y-auto overscroll-contain bg-muslin px-5 py-5 shadow-2xl sm:px-10 sm:py-6"
          >
            {/* DRAWER HEADER */}
            <div className="flex items-start justify-between border-b border-thread-grey/25 pb-5 sm:pb-6">
              {" "}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="py-1"
              >
                {" "}
                <p className="font-brand text-lg tracking-[0.2em] text-thread-black">
                  {" "}
                  SOZAN{" "}
                </p>{" "}
                <p className="mt-1 font-utility text-[7px] tracking-[0.35em] text-thread-grey">
                  {" "}
                  / NAZM /{" "}
                </p>{" "}
              </Link>{" "}
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-thread-grey/30 text-thread-black transition-all duration-300 hover:bg-thread-black hover:text-muslin"
              >
                {" "}
                <X size={17} strokeWidth={1.35} />{" "}
              </button>{" "}
            </div>{" "}
            {/* NAVIGATION */}{" "}
            <div className="py-8 sm:py-10">
              {" "}
              <div className="mb-5 flex items-center gap-3 sm:mb-7">
                {" "}
                <span className="h-px w-8 bg-awadh-ink" />{" "}
                <p className="font-utility text-[9px] tracking-[0.24em] text-awadh-ink">
                  {" "}
                  EXPLORE{" "}
                </p>{" "}
              </div>{" "}
              <nav className="flex flex-col">
                {" "}
                {menuItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex min-h-[64px] items-center justify-between border-b border-thread-grey/20 py-4 sm:min-h-0 sm:py-5 ${isActive(item.href) ? "text-awadh-ink" : "text-thread-black"}`}
                  >
                    {" "}
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                      {" "}
                      <span className="shrink-0 font-utility text-[8px] tracking-[0.18em] text-thread-grey">
                        {" "}
                        0{index + 1}{" "}
                      </span>{" "}
                      <span className="font-display text-[22px] leading-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-[28px] sm:leading-none">
                        {" "}
                        {item.label}{" "}
                      </span>{" "}
                    </div>{" "}
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.25}
                      className="ml-3 shrink-0 text-thread-grey transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-awadh-ink"
                    />{" "}
                  </Link>
                ))}{" "}
              </nav>{" "}
            </div>{" "}
            {/* ACCOUNT */}{" "}
            <div className="border-t border-thread-grey/20 pt-6 sm:pt-7">
              {" "}
              <p className="mb-5 font-utility text-[8px] tracking-[0.24em] text-thread-grey">
                {" "}
                YOUR SPACE{" "}
              </p>{" "}
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-5">
                {" "}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-10 items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-awadh-ink transition-colors hover:text-thread-black"
                  >
                    {" "}
                    <ArrowUpRight size={15} strokeWidth={1.35} /> ADMIN
                    DASHBOARD{" "}
                  </Link>
                )}{" "}
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-10 items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
                >
                  {" "}
                  <Heart size={15} strokeWidth={1.35} /> WISHLIST{" "}
                </Link>{" "}
                <Link
                  href={isLoggedIn ? "/profile" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-10 items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
                >
                  {" "}
                  <User size={15} strokeWidth={1.35} />{" "}
                  {isLoggedIn ? "ACCOUNT" : "SIGN IN"}{" "}
                </Link>{" "}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-10 items-center gap-2 font-utility text-[9px] tracking-[0.18em] text-thread-grey transition-colors hover:text-thread-black"
                  >
                    {" "}
                    <LogOut size={15} strokeWidth={1.35} /> LOG OUT{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
            {/* DRAWER FOOTER */}{" "}
            <div className="mt-auto border-t border-thread-grey/20 pt-5 sm:mt-8">
              {" "}
              <p className="max-w-xs font-editorial text-sm italic leading-relaxed text-thread-grey">
                {" "}
                Dress for the story you&apos;re about to tell.{" "}
              </p>{" "}
              <p className="mt-4 font-utility text-[7px] tracking-[0.24em] text-thread-grey/60">
                {" "}
                SOZAN / NAZM{" "}
              </p>{" "}
            </div>{" "}
          </aside>{" "}
        </div>
      )}{" "}
    </>
  );
}
