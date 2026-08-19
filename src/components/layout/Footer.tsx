import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-kora bg-thread-black text-muslin">
      <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        {/* Top */}
        <div className="grid gap-14 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          {/* Brand */}
          <div>
            <p className="font-utility text-[9px] tracking-[0.25em] text-awadh-ink">
              SOZAN
            </p>

            <h2 className="mt-5 max-w-lg font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              Dress for the
              <br />
              story.
            </h2>

            <p className="mt-8 max-w-md font-editorial text-lg leading-relaxed text-muslin/60">
              Thoughtfully chosen pieces for everyday moments, quiet
              celebrations, and everything in between.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="font-utility text-[9px] tracking-[0.22em] text-muslin/40">
              EXPLORE
            </p>

            <nav className="mt-6 flex flex-col gap-4">
              <Link
                href="/products"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                SHOP ALL
              </Link>

              <Link
                href="/products?category=women"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                WOMEN
              </Link>

              <Link
                href="/products?category=men"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                MEN
              </Link>

              <Link
                href="/products?collection=new-arrivals"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                NEW ARRIVALS
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div>
            <p className="font-utility text-[9px] tracking-[0.22em] text-muslin/40">
              YOUR SPACE
            </p>

            <nav className="mt-6 flex flex-col gap-4">
              <Link
                href="/wishlist"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                WISHLIST
              </Link>

              <Link
                href="/cart"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                BAG
              </Link>

              <Link
                href="/orders"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                ORDERS
              </Link>

              <Link
                href="/login"
                className="font-utility text-[10px] tracking-[0.16em] transition-colors hover:text-awadh-ink"
              >
                ACCOUNT
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="font-utility text-[9px] tracking-[0.22em] text-muslin/40">
              GET IN TOUCH
            </p>

            <div className="mt-6">
              <a
                href="mailto:hello@sozan.in"
                className="group flex items-center justify-between border-b border-muslin/20 py-4"
              >
                <span className="font-editorial text-base text-muslin/80">
                  Email us
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>

              <p className="mt-6 max-w-xs font-editorial text-sm leading-relaxed text-muslin/50">
                Questions about an order, a piece, or simply what to wear? We
                {`'`}re here.
              </p>
            </div>
          </div>
        </div>

        {/* Thread */}
        <div className="relative mt-20 h-px bg-muslin/20">
          <div className="absolute left-0 top-1/2 h-px w-1/3 -translate-y-1/2 bg-awadh-ink" />
        </div>

        {/* Bottom */}
        <div className="flex flex-col justify-between gap-5 pt-6 sm:flex-row sm:items-center">
          <p className="font-utility text-[8px] tracking-[0.18em] text-muslin/40">
            © 2026 SOZAN / NAZM / ALL RIGHTS RESERVED
          </p>

          <p className="font-utility text-[8px] tracking-[0.18em] text-muslin/40">
            MADE WITH INTENTION
          </p>
        </div>
      </div>
    </footer>
  );
}
