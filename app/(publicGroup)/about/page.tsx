import type { Metadata } from "next";

import { AboutContent } from "@/app/(publicGroup)/about/_components/about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how FixItNow connects homeowners with verified technicians through a clear booking, payment, and tracking workflow.",
};

export default function AboutPage() {
  return <AboutContent />;
}
