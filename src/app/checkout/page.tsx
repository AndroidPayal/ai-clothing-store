"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingForm from "@/components/checkout/ShippingForm";

export default function Checkout() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-muslin">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* Header */}
          <div className="border-b border-kora pb-8">
            <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              06 — CHECKOUT
            </p>

            <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                  Almost
                  <br />
                  yours.
                </h1>
              </div>

              <p className="max-w-sm font-editorial text-lg leading-relaxed text-thread-grey">
                Complete your details and we{`'`}ll take care of the rest.
              </p>
            </div>
          </div>

          {/* Checkout content */}
          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Order */}
            <div>
              <div className="mb-6 border-b border-kora pb-4">
                <p className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
                  01 — YOUR ORDER
                </p>
              </div>

              <OrderSummary />
            </div>

            {/* Shipping */}
            <div>
              <div className="mb-6 border-b border-kora pb-4">
                <p className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
                  02 — DELIVERY DETAILS
                </p>
              </div>

              <ShippingForm />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
