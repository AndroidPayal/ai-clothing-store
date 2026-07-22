"use client";

import { Order } from "@/data/products";
import { useState } from "react";
import OrderCard from "@/components/orders/OrderCard";
import EmptyState from "@/components/common/EmptyState";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
        <ProtectedRoute>
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

                <EmptyState
                    emoji="📦"
                    title="No Orders Yet"
                    description="You haven't placed any orders."
                    buttonText="Start Shopping"
                    href="/"
                />

                )}

            </div>
        
        </div>
        </ProtectedRoute>
    );
}