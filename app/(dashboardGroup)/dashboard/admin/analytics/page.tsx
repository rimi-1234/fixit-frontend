import type { Metadata } from "next";

import { AdminAnalyticsPage } from "@/app/(dashboardGroup)/dashboard/admin/analytics/_components/admin-analytics";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function Page() {
  return <AdminAnalyticsPage />;
}
