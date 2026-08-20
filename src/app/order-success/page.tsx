import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function OrderSuccess() {
  return (
    <main className="min-h-screen bg-muslin">
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px] items-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="w-full">
          {/* Section label */}
          <div className="border-b border-kora pb-5">
            <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              07 — ORDER CONFIRMED
            </p>
          </div>

          <div className="mx-auto max-w-3xl py-20 text-center sm:py-28">
            {/* Success mark */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-awadh-ink text-awadh-ink">
              <Check size={28} strokeWidth={1.5} />
            </div>

            <p className="mt-10 font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              PAYMENT SUCCESSFUL
            </p>

            <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              It{`'`}s on
              <br />
              its way.
            </h1>

            <p className="mx-auto mt-8 max-w-lg font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
              Your order has been placed successfully. Thank you for choosing
              SOZAN.
            </p>

            <div className="mx-auto mt-12 h-px w-16 bg-awadh-ink" />

            {/* Actions */}
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-4 bg-thread-black px-7 py-4 font-utility text-[9px] tracking-[0.2em] text-muslin transition-colors hover:bg-awadh-ink"
              >
                VIEW YOUR ORDERS
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-center border border-thread-black px-7 py-4 font-utility text-[9px] tracking-[0.2em] text-thread-black transition-colors hover:bg-thread-black hover:text-muslin"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>

          {/* Bottom note */}
          <div className="border-t border-kora pt-6">
            <p className="text-center font-editorial text-sm italic text-thread-grey">
              A confirmation of your order is now part of your story.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
