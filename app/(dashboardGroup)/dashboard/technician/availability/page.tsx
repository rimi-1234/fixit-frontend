import type { Metadata } from "next";

import { AvailabilityManager } from "@/app/(dashboardGroup)/dashboard/technician/availability/_components/availability-manager";

export const metadata: Metadata = {
  title: "Availability",
};

export default function TechnicianAvailabilityPage() {
  return <AvailabilityManager />;
}
