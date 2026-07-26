"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  House,
  ClipboardList,
  LogIn,
  User,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

type NavbarProps = {
  cartCount: number;
  wishlistCount: number;
};

export default function Navbar({
  cartCount,
  wishlistCount,
}: NavbarProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  const router = useRouter();
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
  ];

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    })

    toast.success("Logged out successfully");

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-slate-900"
        >
          AI Clothing Store
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">

          {/* Main Navigation */}
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
            className={`
              relative
              rounded-lg
              p-2
              transition
              ${
                pathname === "/wishlist"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-gray-100 hover:text-blue-600"
              }
            `}
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
            className={`
              relative
              rounded-lg
              p-2
              transition
              ${
                pathname === "/cart"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-gray-100 hover:text-blue-600"
              }
            `}
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

          {/* Authentication */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">

              {/* User Name */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                <User
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-medium text-gray-800">
                  Hi, {user?.name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-red-500
                  px-3
                  py-2
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                <LogOut size={18} />

                <span>
                  Logout
                </span>
              </button>

            </div>
          ) : (
            <div className="flex items-center gap-2">

              {/* Login */}
              <Link
                href="/login"
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-blue-600
                  px-3
                  py-2
                  font-medium
                  text-blue-600
                  transition
                  hover:bg-blue-50
                "
              >
                <LogIn size={18} />

                <span>
                  Login
                </span>
              </Link>

              {/* Signup */}
              <Link
                href="/signup"
                className="
                  rounded-lg
                  bg-blue-600
                  px-4
                  py-2
                  font-medium
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                Sign Up
              </Link>

            </div>
          )}

        </div>

      </nav>
    </header>
  );
}