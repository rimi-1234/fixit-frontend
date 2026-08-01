import type { Metadata } from "next";

import { TechnicianProfileView } from "@/app/(publicGroup)/_components/technician-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Technician profile",
    description: `View technician ${id} on FixItNow`,
  };
}

export default async function TechnicianProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <TechnicianProfileView technicianId={id} />;
}
