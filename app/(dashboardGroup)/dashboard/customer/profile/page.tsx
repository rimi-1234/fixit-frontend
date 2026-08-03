import type { Metadata } from "next";

import { CustomerProfilePage } from "@/app/(dashboardGroup)/dashboard/customer/profile/_components/customer-profile";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return <CustomerProfilePage />;
}
