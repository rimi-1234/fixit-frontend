import type { Metadata } from "next";

import { CustomerPaymentsPage } from "@/app/(dashboardGroup)/dashboard/customer/payments/_components/customer-payments";

export const metadata: Metadata = {
  title: "Payments",
};

export default function Page() {
  return <CustomerPaymentsPage />;
}
