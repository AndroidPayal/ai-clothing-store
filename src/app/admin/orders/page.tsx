"use client";

import { useCallback, useEffect, useState } from "react";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type OrderItem = {
  id?: number | string;
  title?: string;
  price?: number;
  quantity?: number;
  inStock?: boolean;
  thumbnail?: string;
  image?: string;
  category?: string;
  description?: string;

  // Support older order structure
  product?: {
    id?: number | string;
    title?: string;
    price?: number;
  };
};

type AdminOrder = {
  _id: string;

  items?: OrderItem[];

  total?: number;

  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;

  // Support older structure
  customer?: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    pinCode?: string;
  };

  status: OrderStatus;
  createdAt: string;
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Pending", "Confirmed", "Cancelled"],
  Confirmed: ["Confirmed", "Shipped"],
  Shipped: ["Shipped", "Delivered"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

const statusClasses: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    const response = await fetch("/api/admin/orders", {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch admin orders");
    }

    return Array.isArray(data.orders) ? (data.orders as AdminOrder[]) : [];
  };

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders();

        if (cancelled) return;

        setOrders(fetchedOrders);
        setError("");
      } catch (error) {
        if (cancelled) return;

        console.error("Admin orders fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch admin orders",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = useCallback(async () => {
    try {
      setIsRetrying(true);
      setError("");

      const fetchedOrders = await fetchOrders();

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Admin orders retry error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch admin orders",
      );
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order?.status ?? status,
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
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">
          All Orders
        </h1>

        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">Loading orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            All Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage customer orders and update delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRetrying ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* EMPTY */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const availableStatuses =
              allowedTransitions[order.status] ?? allowedTransitions.Pending;

            const isUpdating = updatingOrderId === order._id;

            const items = Array.isArray(order.items) ? order.items : [];

            const customer = order.customer ?? {
              fullName: order.fullName ?? "Customer",
              phone: order.phone ?? "—",
              address: order.address ?? "—",
              city: order.city ?? "—",
              pinCode: order.pinCode ?? "—",
            };

            const total = Number(order.total ?? 0);

            return (
              <article
                key={order._id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
              >
                {/* ORDER HEADER */}
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-gray-900">
                      {order._id}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN")
                        : "—"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[order.status] ?? statusClasses.Pending
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* CUSTOMER + ITEMS */}
                <div className="grid gap-6 py-6 lg:grid-cols-2">
                  {/* CUSTOMER */}
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </h2>

                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">
                        {customer.fullName || "—"}
                      </p>

                      <p>{customer.phone || "—"}</p>

                      <p>
                        {customer.address || "—"}
                        {customer.city ? `, ${customer.city}` : ""}
                        {customer.pinCode ? ` - ${customer.pinCode}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Items
                    </h2>

                    {items.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No item details available.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, index) => {
                          const product = item.product ?? item;

                          const title = product.title ?? "Unnamed product";

                          const price = Number(product.price ?? 0);

                          const quantity = Number(item.quantity ?? 1);

                          const productId = product.id ?? item.id ?? index;

                          return (
                            <div
                              key={`${productId}-${index}`}
                              className="flex items-start justify-between gap-4 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900">
                                  {title}
                                </p>

                                <p className="text-gray-500">
                                  Qty: {quantity} × ₹{" "}
                                  {price.toLocaleString("en-IN")}
                                </p>
                              </div>

                              <p className="shrink-0 font-medium text-gray-900">
                                ₹ {(price * quantity).toLocaleString("en-IN")}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* TOTAL */}
                  <div>
                    <p className="text-sm text-gray-500">Order Total</p>

                    <p className="text-2xl font-bold text-gray-900">
                      ₹ {total.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <label
                      htmlFor={`status-${order._id}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Update status
                    </label>

                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      disabled={isUpdating || availableStatuses.length === 1}
                      onChange={(event) => {
                        void updateOrderStatus(
                          order._id,
                          event.target.value as OrderStatus,
                        );
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {isUpdating && (
                      <span className="text-xs text-gray-500">Updating...</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
