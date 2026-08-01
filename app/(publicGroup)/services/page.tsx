import type { Metadata } from "next";

import { ServicesBrowse } from "@/app/(publicGroup)/_components/services-browse";

export const metadata: Metadata = {
  title: "Browse services",
};

export default function ServicesPage() {
  return <ServicesBrowse />;
}
