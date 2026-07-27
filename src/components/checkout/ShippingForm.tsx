"use client";

import Button from "@/components/ui/Button";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ShippingForm() {
  const router = useRouter();

  const { cart, cartTotal, clearCart } = useCart();
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
      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          customer: formData,
        }),
      });

      const data = await response.json();

      console.log("ORDER API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      // Only clear cart AFTER successful MongoDB save
      clearCart();

      setTimeout(() => {
        toast.success("Order Placed Successfully 🎉");
        router.push("/order-success");
      }, 1000);
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
      );
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
          text="Place Order"
          disabled={!isFormValid || cart.length === 0}
        />
      </form>
    </div>
  );
}
