"use client";

import Link from "next/link";
import { Order } from "@/data/products";

type OrderCardProps = {
    order: Order;
};

export default function OrderCard({
    order,
}: OrderCardProps) {

    return (
        <div className="rounded-lg border p-5 shadow hover:shadow-lg transition">

            <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                    {order.id}
                </h2>

                <p className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                </p>

            </div>

            <p className="mt-3">
                Total Items :{" "}
                {order.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                )}
            </p>

            <p className="mt-2 text-xl font-semibold text-blue-600">
                ₹{order.total}
            </p>

            <Link
                href={`/orders/${order.id}`}
                className="mt-4 inline-block text-blue-600 hover:underline"
            >
                View Details →
            </Link>

        </div>
    );
}