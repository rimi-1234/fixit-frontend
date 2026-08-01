import type { Metadata } from "next";

import { TechnicianDashboard } from "@/app/(dashboardGroup)/dashboard/technician/_components/technician-dashboard";

export const metadata: Metadata = {
  title: "Technician dashboard",
};

export default function TechnicianDashboardPage() {
  return <TechnicianDashboard />;
}
