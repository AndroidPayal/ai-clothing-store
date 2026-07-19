"use client";

import Button from "@/components/ui/Button";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ShippingForm(){
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
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    
    return (
        <div>

          <h2 className="mb-5 text-2xl font-semibold">
            Shipping Address
          </h2>

          <form className="space-y-4">

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
                onClick={() => {

                    if (cart.length === 0) {
                        alert("Your cart is empty.");
                        return;
                    }

                    if (!isFormValid) {
                        alert("Please fill all the fields.");
                        return;
                    }

                    const existingOrders =
                        JSON.parse(localStorage.getItem("orders") || "[]");

                    const newOrder = {
                        id: `ORD-${Date.now()}`,

                        items: cart,

                        total: cartTotal,

                        customer: formData,

                        createdAt: new Date().toISOString(),
                    };

                    existingOrders.push(newOrder);

                    localStorage.setItem(
                        "orders",
                        JSON.stringify(existingOrders)
                    );

                    clearCart();
                    router.push("/order-success");
                }}
            />

          </form>

        </div>


    )
}