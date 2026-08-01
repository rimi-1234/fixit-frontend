import type { Metadata } from "next";

import { FeaturedServices } from "@/app/(publicGroup)/_components/featured-services";
import { Hero } from "@/app/(publicGroup)/_components/hero";
import { HowItWorks } from "@/app/(publicGroup)/_components/how-it-works";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { TopTechnicians } from "@/app/(publicGroup)/_components/top-technicians";
import { TrustStrip } from "@/app/(publicGroup)/_components/trust-strip";

export const metadata: Metadata = {
  title: "Book Trusted Home Service Technicians",
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <TrustStrip />
      <FeaturedServices />
      <HowItWorks />
      <TopTechnicians />
      <SiteFooter />
    </main>
  );
}
