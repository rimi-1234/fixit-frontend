import type { Metadata } from "next";

import { CustomerDashboard } from "@/app/(dashboardGroup)/dashboard/customer/_components/customer-dashboard";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}
