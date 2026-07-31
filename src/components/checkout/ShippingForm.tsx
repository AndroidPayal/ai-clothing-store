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
    <div>
      <h2 className="mb-5 text-2xl font-semibold">Shipping Address</h2>

      <form className="space-y-4" onSubmit={handlePlaceOrder}>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full rounded-lg border p-3"
        />

        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full rounded-lg border p-3"
        />

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={4}
          placeholder="Address"
          className="w-full rounded-lg border p-3"
        />

        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full rounded-lg border p-3"
        />

        <input
          name="pinCode"
          value={formData.pinCode}
          onChange={handleChange}
          placeholder="Pin Code"
          className="w-full rounded-lg border p-3"
        />

        <Button
          text={isProcessing ? "Processing..." : "Pay & Place Order"}
          disabled={!isFormValid || cart.length === 0 || isProcessing}
          type="submit"
        />
      </form>
    </div>
  );
}
