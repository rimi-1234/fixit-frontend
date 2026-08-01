import type { Metadata } from "next";

import { TechnicianServicesManager } from "@/app/(dashboardGroup)/dashboard/technician/services/_components/services-manager";

export const metadata: Metadata = {
  title: "My services",
};

export default function TechnicianServicesPage() {
  return <TechnicianServicesManager />;
}
