import type { Metadata } from "next";

import { CustomerReviewsPage } from "@/app/(dashboardGroup)/dashboard/customer/reviews/_components/customer-reviews";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function Page() {
  return <CustomerReviewsPage />;
}
