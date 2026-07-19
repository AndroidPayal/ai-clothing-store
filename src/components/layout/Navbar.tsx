"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  House,
  ClipboardList,
  Phone,
} from "lucide-react";

type NavbarProps = {
  cartCount: number;
  wishlistCount: number;
};

export default function Navbar({
  cartCount,
  wishlistCount,
}: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: House,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ClipboardList,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: Phone,
    },
  ];

  return (
 <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm backdrop-blur">
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-slate-900"
        >
          AI Clothing Store
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">

          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-2
                  rounded-lg
                  px-3
                  py-2
                  transition
                  ${
                    isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative rounded-lg p-2 text-slate-700 transition hover:bg-gray-100 hover:text-blue-600"
          >
            <Heart size={24} />

            {wishlistCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  text-xs
                  text-white
                "
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-slate-700 transition hover:bg-gray-100 hover:text-blue-600"
         
         >
            <ShoppingCart size={24} />

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  text-xs
                  text-white
                "
              >
                {cartCount}
              </span>
            )}
          </Link>

        </div>

      </nav>
    </header>
  );
}