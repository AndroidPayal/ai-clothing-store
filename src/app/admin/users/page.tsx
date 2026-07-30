"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/users");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        setUsers(data.users);
      } catch (error) {
        console.error("Admin users fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, role: AdminUser["role"]) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: data.user.role,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error("Update user role error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update user role",
      );
    }
  };
  if (isLoading) {
    return (
      <section className="p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Users</h1>

        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-lg font-medium text-gray-600">Loading users...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Users</h1>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-900">Users</h1>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-lg text-gray-600">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-6 py-4 font-semibold text-gray-900">Name</th>

                <th className="px-6 py-4 font-semibold text-gray-900">Email</th>

                <th className="px-6 py-4 font-semibold text-gray-900">Role</th>

                <th className="px-6 py-4 font-semibold text-gray-900">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.fullName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{user.email}</td>

                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserRole(
                          user._id,
                          e.target.value as AdminUser["role"],
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
