"use client";

import useCart from "@/hooks/useCart";
import Image from "next/image";

export default function OrderSummary() {
  const { cart, cartTotal } = useCart();

  return (
    <div className="border border-kora bg-muslin p-6 sm:p-8">
      <div className="flex items-end justify-between border-b border-kora pb-5">
        <div>
          <p className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
            YOUR SELECTION
          </p>

          <h2 className="mt-3 font-display text-3xl text-thread-black">
            Order summary
          </h2>
        </div>

        <span className="font-utility text-[9px] tracking-[0.15em] text-thread-grey">
          {cart.length} {cart.length === 1 ? "PIECE" : "PIECES"}
        </span>
      </div>

      <div className="divide-y divide-kora">
        {cart.map((cartItem) => (
          <div key={cartItem.product.id} className="flex gap-5 py-6">
            {/* Product image */}
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-kora">
              <Image
                src={cartItem.product.thumbnail}
                alt={cartItem.product.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            {/* Product information */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="font-utility text-[8px] tracking-[0.16em] text-awadh-ink">
                  {cartItem.product.category.toUpperCase()}
                </p>

                <h3 className="mt-2 font-display text-xl leading-tight text-thread-black">
                  {cartItem.product.title}
                </h3>
              </div>

              <p className="mt-3 font-utility text-[8px] tracking-[0.14em] text-thread-grey">
                QUANTITY · {cartItem.quantity}
              </p>
            </div>

            {/* Price */}
            <div className="shrink-0">
              <p className="font-editorial text-lg text-thread-black">
                ₹{" "}
                {(cartItem.product.price * cartItem.quantity).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-thread-black pt-6">
        <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
          TOTAL
        </span>

        <span className="font-display text-3xl text-thread-black">
          ₹ {cartTotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
