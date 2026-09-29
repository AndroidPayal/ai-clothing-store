"use client";

import useCart from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ShippingForm() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pinCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((previous) => ({
        ...previous,
        phone: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }

    if (name === "pinCode") {
      setFormData((previous) => ({
        ...previous,
        pinCode: value.replace(/\D/g, "").slice(0, 6),
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const fullName = formData.fullName.trim();
  const phone = formData.phone.replace(/\D/g, "");
  const address = formData.address.trim();
  const city = formData.city.trim();
  const pinCode = formData.pinCode.replace(/\D/g, "");

  const isFormValid =
    fullName !== "" &&
    phone.length === 10 &&
    address !== "" &&
    city !== "" &&
    pinCode.length === 6;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const generateIdempotencyKey = () => {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
      .toString(36)
      .slice(2)}`;
  };

  const getCheckoutIdempotencyKey = () => {
    const storageKey = "checkout-idempotency-data";

    const checkoutData = JSON.stringify({
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      customer: {
        fullName,
        phone,
        address,
        city,
        pinCode,
      },
    });

    const stored = sessionStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          fingerprint?: string;
          key?: string;
        };

        if (
          parsed.fingerprint === checkoutData &&
          typeof parsed.key === "string" &&
          parsed.key.length >= 16
        ) {
          return parsed.key;
        }
      } catch {
        // Invalid stored checkout data — generate a fresh key.
      }
    }

    const newKey = generateIdempotencyKey();

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        fingerprint: checkoutData,
        key: newKey,
      }),
    );

    return newKey;
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) {
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isFormValid) {
      if (fullName.length < 2) {
        toast.warning("Please enter your full name");
        return;
      }

      if (phone.length < 10) {
        toast.warning("Please enter a valid 10-digit mobile number");
        return;
      }

      if (address.length < 5) {
        toast.warning("Please enter your complete address");
        return;
      }

      if (city.length < 2) {
        toast.warning("Please enter your city");
        return;
      }

      if (pinCode.length < 6) {
        toast.warning("Please enter a valid 6-digit PIN code");
        return;
      }

      return;
    }

    try {
      setIsProcessing(true);

      const isRazorpayLoaded = await loadRazorpayScript();

      if (!isRazorpayLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load secure payment. Please check your internet connection and try again.",
        );
      }

      const checkoutStorageKey = "checkout-idempotency-data";
      const idempotencyKey = getCheckoutIdempotencyKey();

      const paymentResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            fullName,
            phone,
            address,
            city,
            pinCode,
          },
        }),
      });

      const paymentData = await paymentResponse.json().catch(() => null);

      if (!paymentResponse.ok) {
        throw new Error(paymentData?.message || "Failed to create payment");
      }

      const razorpayOrder = paymentData?.order;

      if (
        !razorpayOrder?.id ||
        typeof razorpayOrder.amount !== "number" ||
        !razorpayOrder.currency
      ) {
        throw new Error("Invalid payment order received from server");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay key is missing");
      }

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AI Clothing Store",
        description: "Clothing Store Purchase",
        order_id: razorpayOrder.id,

        prefill: {
          name: fullName,
          contact: phone,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response: RazorpayResponse) {
          try {
            const orderResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const orderData = await orderResponse.json().catch(() => null);

            if (!orderResponse.ok) {
              throw new Error(
                orderData?.message ||
                  "Payment succeeded but order confirmation failed",
              );
            }

            clearCart();
            sessionStorage.removeItem(checkoutStorageKey);

            toast.success("Payment successful! Order placed 🎉");

            router.push("/order-success");
          } catch (error) {
            console.error("PAYMENT VERIFICATION ERROR:", error);

            toast.error(
              error instanceof Error
                ? error.message
                : "Payment succeeded but order confirmation failed",
            );

            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to start payment",
      );

      setIsProcessing(false);
    }
  };

  return (
    <div className="border border-kora bg-muslin p-5 sm:p-8">
      <div className="border-b border-kora pb-5">
        <p className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
          DELIVERY
        </p>

        <h2 className="mt-3 font-display text-3xl text-thread-black">
          Shipping address
        </h2>

        <p className="mt-3 font-editorial text-sm leading-relaxed text-thread-grey">
          Where should we send your pieces?
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handlePlaceOrder}>
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block font-utility text-[8px] tracking-[0.16em] text-thread-grey"
          >
            FULL NAME
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            maxLength={80}
            required
            disabled={isProcessing}
            className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block font-utility text-[8px] tracking-[0.16em] text-thread-grey"
          >
            PHONE NUMBER
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            maxLength={10}
            required
            disabled={isProcessing}
            className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block font-utility text-[8px] tracking-[0.16em] text-thread-grey"
          >
            ADDRESS
          </label>

          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={4}
            placeholder="House number, street, locality..."
            autoComplete="street-address"
            maxLength={300}
            required
            disabled={isProcessing}
            className="w-full resize-none border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block font-utility text-[8px] tracking-[0.16em] text-thread-grey"
            >
              CITY
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              autoComplete="address-level2"
              maxLength={80}
              required
              disabled={isProcessing}
              className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="pinCode"
              className="mb-2 block font-utility text-[8px] tracking-[0.16em] text-thread-grey"
            >
              PIN CODE
            </label>

            <input
              id="pinCode"
              name="pinCode"
              type="text"
              inputMode="numeric"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="6-digit PIN"
              autoComplete="postal-code"
              maxLength={6}
              required
              disabled={isProcessing}
              className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="border-y border-kora py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey">
              PAYMENT
            </span>

            <span className="font-utility text-[8px] tracking-[0.16em] text-thread-black">
              RAZORPAY · SECURE
            </span>
          </div>

          <p className="mt-3 font-editorial text-sm leading-relaxed text-thread-grey">
            You&apos;ll securely complete your payment through Razorpay.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || cart.length === 0 || isProcessing}
          className="flex min-h-12 w-full items-center justify-between gap-4 bg-thread-black px-5 py-4 font-utility text-[9px] tracking-[0.16em] text-muslin transition-colors hover:bg-awadh-ink focus:outline-none focus:ring-2 focus:ring-awadh-ink focus:ring-offset-4 focus:ring-offset-muslin disabled:cursor-not-allowed disabled:bg-thread-grey sm:tracking-[0.2em]"
        >
          <span>{isProcessing ? "PROCESSING..." : "PAY & PLACE ORDER"}</span>

          <span className="text-base" aria-hidden="true">
            →
          </span>
        </button>

        <p className="text-center font-editorial text-xs italic text-thread-grey">
          Your payment is processed securely.
        </p>
      </form>
    </div>
  );
}
