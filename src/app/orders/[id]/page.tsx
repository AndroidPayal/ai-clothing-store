"use client";

import { useParams } from "next/navigation";
import { Order } from "@/data/products";

export default function OrderDetails() {

    const params = useParams();

    const orderId = params.id as string;

    const orders: Order[] =
        JSON.parse(localStorage.getItem("orders") || "[]");

    const currentOrder =
        orders.find((order) => order.id === orderId);

    if (!currentOrder) {
        return (
            <h1 className="p-8 text-3xl font-bold">
                Order Not Found
            </h1>
        );
    }

    return (
        <div>
            <section className="mx-auto max-w-5xl p-8">

                <h1 className="mb-8 text-4xl font-bold border-b">
                    Order Details
                </h1>

                <div className="mb-8 rounded-lg pt-6 ">

                    <h2 className="text-xl font-bold">
                        {currentOrder.id}
                    </h2>

                    <p className="mt-2 text-gray-500">
                        {new Date(
                            currentOrder.createdAt
                        ).toLocaleString()}
                    </p>

                </div>
                <div className="space-y-5">

                    {currentOrder.items.map((cartItem) => (

                        <div
                            key={cartItem.product.id}
                            className="flex items-center justify-between "
                        >

                            <div>

                                <h2 className="text-xl font-semibold">
                                    {cartItem.product.title}
                                </h2>

                                <p>
                                    Qty : {cartItem.quantity}
                                </p>

                            </div>

                            <p className="font-bold">
                                ₹{cartItem.product.price * cartItem.quantity}
                            </p>

                        </div>

                    ))}

                </div>

                <div className="mt-8 flex justify-between border-t pt-6 text-3xl font-bold">

                    <span>Grand Total</span>

                    <span>₹{currentOrder.total}</span>

                </div>
                                <div className="mt-8 rounded-lg border p-6">

                    <h2 className="mb-4 text-2xl font-bold">
                        Shipping Address
                    </h2>

                    <p>{currentOrder.customer.fullName}</p>

                    <p>{currentOrder.customer.phone}</p>

                    <p>{currentOrder.customer.address}</p>

                    <p>{currentOrder.customer.city}</p>

                    <p>{currentOrder.customer.pinCode}</p>

                </div>
            </section>
        </div>
    );
}