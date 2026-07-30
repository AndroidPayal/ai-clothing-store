"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/admin",
    },
    {
      label: "Orders",
      href: "/admin/orders",
    },
    {
      label: "Users",
      href: "/admin/users",
    },
    {
      label: "Products",
      href: "/admin/products",
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-6">
      <h2 className="mb-8 text-2xl font-bold">Admin Panel</h2>

      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 font-medium ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
