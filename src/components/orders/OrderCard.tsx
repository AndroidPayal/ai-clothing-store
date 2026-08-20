"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Order } from "@/types/Order";

type OrderCardProps = {
  order: Order;
};

const statusStyles = {
  Pending: "border-yellow-700/30 text-yellow-700",
  Confirmed: "border-blue-700/30 text-blue-700",
  Shipped: "border-purple-700/30 text-purple-700",
  Delivered: "border-green-700/30 text-green-700",
  Cancelled: "border-red-700/30 text-red-700",
};

export default function OrderCard({ order }: OrderCardProps) {
  const totalItems = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article className="group py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* Main information */}
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
              ORDER
            </p>

            <span className="h-px w-6 bg-kora" />

            <p className="font-utility text-[9px] tracking-[0.14em] text-thread-black">
              {order.id}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <h2 className="font-display text-3xl leading-none text-thread-black sm:text-4xl">
              {totalItems} {totalItems === 1 ? "piece" : "pieces"}
            </h2>

            <span
              className={`border px-3 py-1 font-utility text-[8px] tracking-[0.16em] ${
                statusStyles[order.status]
              }`}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <p className="font-utility text-[9px] tracking-[0.14em] text-thread-grey">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            <p className="font-utility text-[9px] tracking-[0.14em] text-thread-grey">
              {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
            </p>
          </div>
        </div>

        {/* Total + action */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <p className="font-editorial text-2xl text-thread-black">
            ₹{order.total.toLocaleString("en-IN")}
          </p>

          <Link
            href={`/orders/${order.id}`}
            className="group/link flex items-center gap-3 border-b border-thread-black pb-2 font-utility text-[9px] tracking-[0.18em] text-thread-black transition-colors hover:border-awadh-ink hover:text-awadh-ink"
          >
            VIEW DETAILS
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
