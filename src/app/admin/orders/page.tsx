"use client";

import { useEffect, useState } from "react";

type AdminOrder = {
  _id: string;
  items: {
    product: {
      id: number;
      title: string;
      price: number;
    };
    quantity: number;
  }[];
  total: number;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pinCode: string;
  };
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/orders");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch admin orders");
        }

        setOrders(data.orders);
      } catch (error) {
        console.error("Admin orders fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    status: AdminOrder["status"],
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order,
        ),
      );
    } catch (error) {
      console.error("Update order status error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order status",
      );
    }
  };

  if (isLoading) {
    return (
      <section className="p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">All Orders</h1>

        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">Loading orders...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">All Orders</h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-900">All Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-lg text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              {/* Order Header */}
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{order._id}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      order._id,
                      e.target.value as AdminOrder["status"],
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  Customer
                </h3>

                <p className="text-gray-700">{order.customer.fullName}</p>

                <p className="text-gray-700">{order.customer.phone}</p>

                <p className="mt-2 text-gray-600">
                  {order.customer.address}, {order.customer.city} -{" "}
                  {order.customer.pinCode}
                </p>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  Products
                </h3>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-900">
                        ₹{item.product.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between border-t pt-5 text-xl font-bold text-gray-900">
                <span>Total</span>

                <span>₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
