"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import Link from "next/link";
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

const statusStyles = {
  Pending: "border-yellow-700/30 text-yellow-700",
  Confirmed: "border-blue-700/30 text-blue-700",
  Shipped: "border-purple-700/30 text-purple-700",
  Delivered: "border-green-700/30 text-green-700",
  Cancelled: "border-red-700/30 text-red-700",
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
      <main className="min-h-screen bg-muslin px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-[1200px]">
          {/* Top navigation */}
          <Link
            href="/orders"
            className="group inline-flex items-center gap-3 font-utility text-[9px] tracking-[0.18em] text-thread-grey transition-colors hover:text-awadh-ink"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            BACK TO ORDERS
          </Link>

          {/* Header */}
          <div className="mt-10 border-b border-kora pb-8">
            <p className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              ORDER — {orderId}
            </p>

            <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl">
                  Your order.
                </h1>

                {!isLoading && currentOrder && (
                  <p className="mt-5 font-editorial text-lg text-thread-grey">
                    Placed{" "}
                    {new Date(currentOrder.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                )}
              </div>

              {!isLoading && currentOrder && (
                <span
                  className={`w-fit border px-4 py-2 font-utility text-[9px] tracking-[0.18em] ${
                    statusStyles[currentOrder.status]
                  }`}
                >
                  {currentOrder.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex min-h-[45vh] items-center justify-center">
              <p className="font-editorial text-xl text-thread-grey">
                Gathering your order...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="mt-12 border border-red-200 bg-red-50 p-6">
              <p className="font-editorial text-lg text-red-600">{error}</p>
            </div>
          )}

          {/* Order */}
          {!isLoading && !error && currentOrder && (
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
              {/* Left — Items */}
              <section>
                <div className="mb-6 flex items-center gap-4">
                  <Package
                    size={18}
                    strokeWidth={1.5}
                    className="text-awadh-ink"
                  />

                  <h2 className="font-utility text-[10px] tracking-[0.2em] text-thread-black">
                    ORDERED PIECES
                  </h2>
                </div>

                <div className="divide-y divide-kora border-y border-kora">
                  {currentOrder.items.map((cartItem) => (
                    <div
                      key={cartItem.product.id}
                      className="flex items-center justify-between gap-6 py-6"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/products/${cartItem.product.id}`}
                          className="font-display text-2xl text-thread-black transition-colors hover:text-awadh-ink"
                        >
                          {cartItem.product.title}
                        </Link>

                        <p className="mt-2 font-utility text-[9px] tracking-[0.14em] text-thread-grey">
                          QTY · {cartItem.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-editorial text-lg text-thread-black">
                        ₹
                        {(
                          cartItem.product.price * cartItem.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-end justify-between border-b border-kora py-8">
                  <div>
                    <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
                      TOTAL
                    </p>

                    <p className="mt-2 font-display text-3xl text-thread-black">
                      {currentOrder.items.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}{" "}
                      {currentOrder.items.length === 1 ? "piece" : "pieces"}
                    </p>
                  </div>

                  <p className="font-editorial text-3xl text-thread-black">
                    ₹{currentOrder.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </section>

              {/* Right — Shipping */}
              <aside>
                <div className="mb-6 flex items-center gap-4">
                  <MapPin
                    size={18}
                    strokeWidth={1.5}
                    className="text-awadh-ink"
                  />

                  <h2 className="font-utility text-[10px] tracking-[0.2em] text-thread-black">
                    SHIPPING ADDRESS
                  </h2>
                </div>

                <div className="border border-kora p-6">
                  <p className="font-display text-2xl text-thread-black">
                    {currentOrder.customer.fullName}
                  </p>

                  <div className="mt-6 space-y-2 font-editorial text-base leading-relaxed text-thread-grey">
                    <p>{currentOrder.customer.phone}</p>
                    <p>{currentOrder.customer.address}</p>
                    <p>{currentOrder.customer.city}</p>
                    <p>{currentOrder.customer.pinCode}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-kora pt-6">
                  <p className="font-editorial text-base italic leading-relaxed text-thread-grey">
                    Thank you for choosing SOZAN. Every piece becomes part of
                    your story.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
