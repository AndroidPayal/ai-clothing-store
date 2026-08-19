"use client";

import Button from "@/components/ui/Button";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ShippingForm() {
  const router = useRouter();

  const { cart, cartTotal, clearCart } = useCart();

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.pinCode.trim() !== "";

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isFormValid) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setIsProcessing(true);

      // Load Razorpay Checkout
      const isRazorpayLoaded = await loadRazorpayScript();

      if (!isRazorpayLoaded) {
        throw new Error(
          "Failed to load Razorpay. Please check your internet connection.",
        );
      }

      // Create Razorpay payment order
      const paymentResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: cartTotal,
        }),
      });
      console.log("PAYMENT RESPONSE:", paymentResponse);
      console.log("PAYMENT RESPONSE STATUS:", paymentResponse.status);

      const paymentData = await paymentResponse.json();
      console.log("PAYMENT DATA:", paymentData);

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Failed to create payment");
      }

      const razorpayOrder = paymentData.order;
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay key is missing");
      }
      // Open Razorpay Checkout
      const options: RazorpayOptions = {
        key: razorpayKey,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "AI Clothing Store",

        description: "Clothing Store Purchase",

        order_id: razorpayOrder.id,

        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response: RazorpayResponse) {
          try {
            console.log("RAZORPAY PAYMENT RESPONSE:", response);

            // Payment successful.
            // Now create MongoDB order.
            const orderResponse = await fetch("/api/payment/verify", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items: cart,
                total: cartTotal,
                customer: formData,
              }),
            });

            const orderData = await orderResponse.json();

            console.log("ORDER API RESPONSE:", orderData);

            if (!orderResponse.ok) {
              throw new Error(
                orderData.message ||
                  "Payment successful but order creation failed",
              );
            }

            // Clear cart only after order is
            // successfully saved.
            clearCart();

            toast.success("Payment successful! Order placed 🎉");

            router.push("/order-success");
          } catch (error) {
            console.error("CREATE ORDER AFTER PAYMENT ERROR:", error);

            toast.error(
              error instanceof Error
                ? error.message
                : "Payment succeeded but order creation failed",
            );
          } finally {
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
    <div className="border border-kora bg-muslin p-6 sm:p-8">
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
        {/* Full name */}
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
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black"
          />
        </div>

        {/* Phone */}
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
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
            className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black"
          />
        </div>

        {/* Address */}
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
            className="w-full resize-none border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black"
          />
        </div>

        {/* City + Pin */}
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
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black"
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
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="PIN code"
              className="w-full border border-kora bg-transparent px-4 py-3 font-editorial text-base text-thread-black outline-none transition-colors placeholder:text-thread-grey/50 focus:border-thread-black"
            />
          </div>
        </div>

        {/* Payment note */}
        <div className="border-y border-kora py-5">
          <div className="flex items-center justify-between">
            <span className="font-utility text-[8px] tracking-[0.16em] text-thread-grey">
              PAYMENT
            </span>

            <span className="font-utility text-[8px] tracking-[0.16em] text-thread-black">
              RAZORPAY · SECURE
            </span>
          </div>

          <p className="mt-3 font-editorial text-sm leading-relaxed text-thread-grey">
            You{`'`}ll be securely redirected to complete your payment.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || cart.length === 0 || isProcessing}
          className="flex w-full items-center justify-between bg-thread-black px-5 py-4 font-utility text-[9px] tracking-[0.2em] text-muslin transition-colors hover:bg-awadh-ink disabled:cursor-not-allowed disabled:bg-thread-grey"
        >
          <span>{isProcessing ? "PROCESSING..." : "PAY & PLACE ORDER"}</span>

          <span className="text-base">→</span>
        </button>

        <p className="text-center font-editorial text-xs italic text-thread-grey">
          Your payment is processed securely.
        </p>
      </form>
    </div>
  );
}
