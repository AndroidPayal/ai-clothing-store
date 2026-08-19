"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import useCart from "@/hooks/useCart";
import CartProductCard from "@/components/product/CartProductCard";
import EmptyState from "@/components/common/EmptyState";

export default function Cart() {
  const { cart, cartTotal } = useCart();

  return (
    <main className="min-h-screen bg-muslin">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        {/* Header */}
        <div className="border-b border-kora pb-8">
          <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            05 — YOUR BAG
          </p>

          <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                Your
                <br />
                selection.
              </h1>
            </div>

            {cart.length > 0 && (
              <p className="font-editorial text-lg text-thread-grey">
                {cart.length} {cart.length === 1 ? "piece" : "pieces"} selected
              </p>
            )}
          </div>
        </div>

        {cart.length > 0 ? (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">
            {/* Cart items */}
            <div>
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
                className="mt-8 inline-flex items-center gap-3 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:text-awadh-ink"
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                CONTINUE SHOPPING
              </Link>
            </div>

            {/* Summary */}
            <aside className="h-fit border border-kora p-6 sm:p-8 lg:sticky lg:top-28">
              <p className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
                SUMMARY
              </p>

              <div className="mt-8 space-y-5 border-b border-kora pb-6">
                <div className="flex items-center justify-between">
                  <span className="font-editorial text-base text-thread-grey">
                    Subtotal
                  </span>

                  <span className="font-editorial text-lg text-thread-black">
                    ₹ {cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-editorial text-base text-thread-grey">
                    Delivery
                  </span>

                  <span className="font-utility text-[9px] tracking-[0.12em] text-thread-black">
                    FREE
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between py-6">
                <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                  TOTAL
                </span>

                <span className="font-display text-3xl text-thread-black">
                  ₹ {cartTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-between bg-thread-black px-5 py-4 font-utility text-[9px] tracking-[0.2em] text-muslin transition-colors hover:bg-awadh-ink"
              >
                PROCEED TO CHECKOUT
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>

              <p className="mt-5 text-center font-editorial text-sm italic text-thread-grey">
                Secure checkout · Free delivery
              </p>
            </aside>
          </div>
        ) : (
          <div className="py-20">
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
