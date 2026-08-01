import type { Metadata } from "next";

import { AdminDashboard } from "@/app/(dashboardGroup)/dashboard/admin/_components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
