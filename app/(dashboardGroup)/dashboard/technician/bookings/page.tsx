import type { Metadata } from "next";

import { TechnicianBookingsTable } from "@/app/(dashboardGroup)/dashboard/technician/bookings/_components/bookings-table";

export const metadata: Metadata = {
  title: "Technician bookings",
};

export default function TechnicianBookingsPage() {
  return <TechnicianBookingsTable />;
}
