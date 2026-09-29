"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingForm from "@/components/checkout/ShippingForm";
import useCart from "@/hooks/useCart";
import Link from "next/link";

export default function Checkout() {
  const { cart } = useCart();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-muslin">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
          {/* Header */}
          <div className="border-b border-kora pb-7 sm:pb-8">
            <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              06 — CHECKOUT
            </p>

            <div className="mt-5 flex flex-col justify-between gap-5 md:mt-6 md:flex-row md:items-end md:gap-6">
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                Almost
                <br />
                yours.
              </h1>

              <p className="max-w-sm font-editorial text-base leading-relaxed text-thread-grey sm:text-lg">
                Complete your details and we{`'`}ll take care of the rest.
              </p>
            </div>
          </div>

          {cart.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-10 sm:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              {/* Order */}
              <section aria-label="Your order">
                <div className="mb-6 border-b border-kora pb-4">
                  <p className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
                    01 — YOUR ORDER
                  </p>
                </div>

                <OrderSummary />
              </section>

              {/* Shipping */}
              <section aria-label="Delivery details">
                <div className="mb-6 border-b border-kora pb-4">
                  <p className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
                    02 — DELIVERY DETAILS
                  </p>
                </div>

                <ShippingForm />
              </section>
            </div>
          ) : (
            <div className="mx-auto max-w-xl py-20 text-center sm:py-28">
              <p className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
                YOUR BAG IS EMPTY
              </p>

              <h2 className="mt-5 font-display text-4xl text-thread-black sm:text-5xl">
                Nothing to checkout.
              </h2>

              <p className="mt-4 font-editorial text-base leading-relaxed text-thread-grey">
                Add a piece to your bag before continuing to checkout.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex min-h-11 items-center justify-center bg-thread-black px-6 py-4 font-utility text-[9px] tracking-[0.18em] text-muslin transition-colors hover:bg-awadh-ink focus:outline-none focus:ring-2 focus:ring-awadh-ink focus:ring-offset-4 focus:ring-offset-muslin"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
