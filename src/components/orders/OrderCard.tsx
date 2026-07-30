"use client";

import Link from "next/link";
import { Order } from "@/types/Order";

type OrderCardProps = {
  order: Order;
};

export default function OrderCard({ order }: OrderCardProps) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-lg border p-5 shadow transition hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{order.id}</h2>

        <p className="text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Order Status */}
      <div className="mt-4">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            statusStyles[order.status]
          }`}
        >
          {order.status}
        </span>
      </div>

      <p className="mt-4">
        Total Items:{" "}
        {order.items.reduce((total, item) => total + item.quantity, 0)}
      </p>

      <p className="mt-2 text-xl font-semibold text-blue-600">₹{order.total}</p>

      <Link
        href={`/orders/${order.id}`}
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        View Details →
      </Link>
    </div>
  );
}
