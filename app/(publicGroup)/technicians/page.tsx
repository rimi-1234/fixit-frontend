import type { Metadata } from "next";

import { TechniciansBrowse } from "@/app/(publicGroup)/_components/technicians-browse";

export const metadata: Metadata = {
  title: "Top-rated professionals",
};

export default function TechniciansPage() {
  return <TechniciansBrowse />;
}
