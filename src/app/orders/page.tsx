"use client";

import { Order } from "@/data/products";
import { useState } from "react";
import OrderCard from "@/components/orders/OrderCard";

export default function Orders() {

    const [orders] = useState<Order[]>(() => {
    try {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
        return [];
    }
    });
console.log(orders);
    return (
        <div className="mx-auto max-w-5xl p-8">
        <h1 className="mb-8 text-4xl font-bold">
            My Orders
        </h1>
        
            <div className="grid gap-5">

                {orders.length > 0 ? (

                    orders.map((order) => (

                        <OrderCard
                            key={order.id}
                            order={order}
                        />

                    ))

                ) : (

                    <p className="text-gray-500">
                        No Orders Yet.
                    </p>

                )}

            </div>
        
        </div>
    );
}