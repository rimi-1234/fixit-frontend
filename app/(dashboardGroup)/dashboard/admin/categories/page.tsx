import type { Metadata } from "next";

import { AdminCategoriesManager } from "@/app/(dashboardGroup)/dashboard/admin/categories/_components/categories-manager";

export const metadata: Metadata = {
  title: "Admin categories",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesManager />;
}
