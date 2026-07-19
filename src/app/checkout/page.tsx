"use client";

import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingForm from "@/components/checkout/ShippingForm";

export default function Checkout() {

    return (
    <section className="mx-auto max-w-6xl p-8">

      <h1 className="mb-8 text-4xl font-bold">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

            {/* Left */}
          <OrderSummary/>

            {/* Right */}
          <ShippingForm
            />
      </div>
    </section>
  );
}