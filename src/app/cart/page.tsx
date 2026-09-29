"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import useCart from "@/hooks/useCart";
import CartProductCard from "@/components/product/CartProductCard";
import EmptyState from "@/components/common/EmptyState";

export default function Cart() {
  const { cart, cartTotal } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0,
  );

  const formattedTotal = cartTotal.toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-muslin">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
        {/* Header */}
        <div className="border-b border-kora pb-7 sm:pb-8">
          <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            05 — YOUR BAG
          </p>

          <div className="mt-5 flex flex-col justify-between gap-5 md:mt-6 md:flex-row md:items-end">
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              Your
              <br />
              selection.
            </h1>

            {cart.length > 0 && (
              <p className="font-editorial text-base text-thread-grey sm:text-lg">
                {totalItems} {totalItems === 1 ? "piece" : "pieces"} selected
              </p>
            )}
          </div>
        </div>

        {cart.length > 0 ? (
          <div className="mt-8 grid gap-10 sm:mt-12 sm:gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">
            {/* Cart items */}
            <section aria-label="Shopping cart items">
              <div className="border-b border-kora pb-4">
                <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                  YOUR PIECES
                </span>
              </div>

              <div>
                {cart.map((cartItem) => (
                  <CartProductCard
                    key={cartItem.product.id}
                    cartItem={cartItem}
                  />
                ))}
              </div>

              <Link
                href="/products"
                className="mt-8 inline-flex min-h-10 items-center gap-3 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink focus:outline-none focus:ring-2 focus:ring-awadh-ink focus:ring-offset-4 focus:ring-offset-muslin"
              >
                <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
                CONTINUE SHOPPING
              </Link>
            </section>

            {/* Summary */}
            <aside
              aria-label="Order summary"
              className="h-fit border border-kora p-5 sm:p-8 lg:sticky lg:top-28"
            >
              <p className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
                SUMMARY
              </p>

              <div className="mt-7 space-y-5 border-b border-kora pb-6 sm:mt-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-editorial text-base text-thread-grey">
                    Subtotal
                  </span>

                  <span className="font-editorial text-base text-thread-black sm:text-lg">
                    ₹ {formattedTotal}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-editorial text-base text-thread-grey">
                    Delivery
                  </span>

                  <span className="font-utility text-[9px] tracking-[0.12em] text-thread-black">
                    FREE
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 py-6">
                <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                  TOTAL
                </span>

                <span className="font-display text-2xl text-thread-black sm:text-3xl">
                  ₹ {formattedTotal}
                </span>
              </div>

              <Link
                href="/checkout"
                aria-label={`Proceed to checkout with ${totalItems} ${
                  totalItems === 1 ? "item" : "items"
                }`}
                className="flex min-h-12 w-full items-center justify-between gap-4 bg-thread-black px-4 py-4 font-utility text-[9px] tracking-[0.16em] text-muslin transition-colors hover:bg-awadh-ink focus:outline-none focus:ring-2 focus:ring-awadh-ink focus:ring-offset-4 focus:ring-offset-muslin sm:px-5 sm:tracking-[0.2em]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight
                  size={15}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="shrink-0"
                />
              </Link>

              <p className="mt-5 text-center font-editorial text-sm italic text-thread-grey">
                Secure checkout · Free delivery
              </p>
            </aside>
          </div>
        ) : (
          <div className="py-16 sm:py-20">
            <EmptyState
              emoji="🛒"
              title="Your Cart is Empty"
              description="Looks like you haven't added any pieces yet."
              buttonText="Continue Shopping"
              href="/products"
            />
          </div>
        )}
      </div>
    </main>
  );
}
