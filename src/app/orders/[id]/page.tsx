"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types/Order";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type MongoDBOrder = {
  _id: string;
  items: Order["items"];
  total: number;
  customer: Order["customer"];
  status: Order["status"];
  createdAt: string;
};

export default function OrderDetails() {
  const params = useParams();

  const orderId = params.id as string;

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/orders/${orderId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order");
        }

        const mongoOrder: MongoDBOrder = data.order;

        const formattedOrder: Order = {
          id: mongoOrder._id,
          items: mongoOrder.items,
          total: mongoOrder.total,
          customer: mongoOrder.customer,
          status: mongoOrder.status,
          createdAt: mongoOrder.createdAt,
        };

        setCurrentOrder(formattedOrder);
      } catch (error) {
        console.error("Fetch order error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  return (
    <ProtectedRoute>
      <div>
        <section className="mx-auto max-w-5xl p-8">
          <h1 className="mb-8 border-b text-4xl font-bold">Order Details</h1>

          {isLoading && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-lg font-medium text-gray-600">
                Loading order details...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="font-medium text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && currentOrder && (
            <>
              <div className="mb-8 rounded-lg pt-6">
                <h2 className="text-xl font-bold">{currentOrder.id}</h2>

                <p className="mt-2 text-gray-500">
                  {new Date(currentOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-6 mb-6">
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="mt-1  font-semibold">{currentOrder.status}</p>
              </div>

              <div className="space-y-5">
                {currentOrder.items.map((cartItem) => (
                  <div
                    key={cartItem.product.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-semibold">
                        {cartItem.product.title}
                      </h2>

                      <p>Qty : {cartItem.quantity}</p>
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
                <h2 className="mb-4 text-2xl font-bold">Shipping Address</h2>

                <p>{currentOrder.customer.fullName}</p>

                <p>{currentOrder.customer.phone}</p>

                <p>{currentOrder.customer.address}</p>

                <p>{currentOrder.customer.city}</p>

                <p>{currentOrder.customer.pinCode}</p>
              </div>
            </>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
