import type { Metadata } from "next";

import { TechnicianProfileForm } from "@/app/(dashboardGroup)/dashboard/technician/profile/_components/profile-form";

export const metadata: Metadata = {
  title: "Technician profile",
};

export default function TechnicianProfilePage() {
  return <TechnicianProfileForm />;
}
