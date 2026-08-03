import type { Metadata } from "next";

import { CustomerBookingsPage } from "@/app/(dashboardGroup)/dashboard/customer/bookings/_components/customer-bookings";

export const metadata: Metadata = {
  title: "Bookings",
};

export default function Page() {
  return <CustomerBookingsPage />;
}
