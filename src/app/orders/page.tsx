"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Order } from "@/types/Order";
import OrderCard from "@/components/orders/OrderCard";
import EmptyState from "@/components/common/EmptyState";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type MongoDBOrder = {
  _id: string;
  items: Order["items"];
  total: number;
  customer: Order["customer"];
  status: Order["status"];
  createdAt: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

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
            status: order.status,
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
  }, [status]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-muslin px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          {/* Page heading */}
          <div className="border-b border-kora pb-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                  YOUR STORY — ORDERS
                </p>

                <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
                  Pieces you{`'`}ve
                  <br />
                  chosen.
                </h1>
              </div>

              {!isLoading && !error && orders.length > 0 && (
                <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                  {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}{" "}
                  PLACED
                </p>
              )}
            </div>
          </div>

          {/* Loading */}
          {(isLoading || status === "loading") && (
            <div className="flex min-h-[45vh] items-center justify-center">
              <p className="font-editorial text-xl text-thread-grey">
                Gathering your story...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="mt-12 border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-editorial text-lg text-red-600">{error}</p>
            </div>
          )}

          {/* Orders */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="divide-y divide-kora border-b border-kora">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="py-20">
              <EmptyState
                emoji="📦"
                title="No Orders Yet"
                description="The first piece of your story is still waiting to be chosen."
                buttonText="EXPLORE THE COLLECTION"
                href="/products"
              />
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
