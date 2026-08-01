import type { Metadata } from "next";

import { AdminUsersTable } from "@/app/(dashboardGroup)/dashboard/admin/users/_components/users-table";

export const metadata: Metadata = {
  title: "Admin users",
};

export default function AdminUsersPage() {
  return <AdminUsersTable />;
}
