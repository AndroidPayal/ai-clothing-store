import AdminRoute from "@/components/auth/AdminRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </AdminRoute>
  );
}
