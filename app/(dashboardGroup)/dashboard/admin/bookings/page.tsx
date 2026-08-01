import type { Metadata } from "next";

import { AdminBookingsTable } from "@/app/(dashboardGroup)/dashboard/admin/bookings/_components/bookings-table";

export const metadata: Metadata = {
  title: "Admin bookings",
};

export default function AdminBookingsPage() {
  return <AdminBookingsTable />;
}
