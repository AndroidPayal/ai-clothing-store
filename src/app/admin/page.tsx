"use client";

import { useEffect, useState } from "react";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSales: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/dashboard");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch dashboard statistics",
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Dashboard stats error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <section className="p-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mb-8 text-gray-600">Overview of your store.</p>

        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
    },
    {
      title: "Pending",
      value: stats.pendingOrders,
    },
    {
      title: "Confirmed",
      value: stats.confirmedOrders,
    },
    {
      title: "Shipped",
      value: stats.shippedOrders,
    },
    {
      title: "Delivered",
      value: stats.deliveredOrders,
    },
    {
      title: "Cancelled",
      value: stats.cancelledOrders,
    },
    {
      title: "Total Sales",
      value: `₹${stats.totalSales}`,
    },
  ];

  return (
    <section className="p-8">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Dashboard</h1>

      <p className="mb-8 text-gray-600">Overview of your store.</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.title}</p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
