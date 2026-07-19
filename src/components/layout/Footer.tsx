import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-gray-100">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-10 md:flex-row md:justify-between">

        {/* Left */}

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            AI Clothing Store
          </h2>

          <p className="mt-3 max-w-sm text-gray-600">
            Modern fashion shopping experience built with
            Next.js, React and Tailwind CSS.
          </p>

        </div>

        {/* Quick Links */}

        <div>

          <h3 className="mb-3 font-semibold text-gray-600">
            Quick Links
          </h3>

          <div className="flex flex-col gap-2 text-gray-600">

            <Link href="/">Home</Link>

            <Link href="/cart">Cart</Link>

            <Link href="/wishlist">Wishlist</Link>

            <Link href="/orders">Orders</Link>

          </div>

        </div>

        {/* Social */}

        <div>

            <h3 className="mb-3 font-semibold">
                Connect
            </h3>
            <div className="flex gap-4">

            <Mail
                size={22}
                className="cursor-pointer hover:text-red-500"
            />

            <Phone
                size={22}
                className="cursor-pointer hover:text-green-500"
            />

            <MapPin
                size={22}
                className="cursor-pointer hover:text-blue-500"
            />

            </div>

        </div>

      </div>

      <div className="border-t py-4 text-center text-sm text-gray-500">

        © 2026 AI Clothing Store • Built with Next.js ❤️

      </div>

    </footer>
  );
}