"use client";

import { useEffect, useState } from "react";
import { Order } from "@/data/products";
import OrderCard from "@/components/orders/OrderCard";
import EmptyState from "@/components/common/EmptyState";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession } from "next-auth/react";

type MongoDBOrder = {
  _id: string;
  items: Order["items"];
  total: number;
  customer: Order["customer"];
  createdAt: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return; // for user who is not logged in

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/orders");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }

        const formattedOrders: Order[] = data.orders.map(
          (order: MongoDBOrder) => ({
            id: order._id,
            items: order.items,
            total: order.total,
            customer: order.customer,
            createdAt: order.createdAt,
          }),
        );

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Fetch orders error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl p-8">
        <h1 className="mb-8 text-4xl font-bold">My Orders</h1>

        {/* Loading */}
        {(isLoading || status === "loading") && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-lg font-medium text-gray-600">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Orders */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="grid gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            emoji="📦"
            title="No Orders Yet"
            description="You haven't placed any orders."
            buttonText="Start Shopping"
            href="/"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
