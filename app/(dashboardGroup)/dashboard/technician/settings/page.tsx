import type { Metadata } from "next";

import { DashboardSettingsPage } from "@/app/(dashboardGroup)/dashboard/_components/settings-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <DashboardSettingsPage />;
}
