import type { Metadata } from "next";

import { BookingJourney } from "@/app/(publicGroup)/_components/booking-journey";
import { FeaturedServices } from "@/app/(publicGroup)/_components/featured-services";
import { Hero } from "@/app/(publicGroup)/_components/hero";
import { HowItWorks } from "@/app/(publicGroup)/_components/how-it-works";
import { LandingCta } from "@/app/(publicGroup)/_components/landing-cta";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { TopTechnicians } from "@/app/(publicGroup)/_components/top-technicians";
import { TrustStrip } from "@/app/(publicGroup)/_components/trust-strip";

export const metadata: Metadata = {
  title: "Book Trusted Home Service Technicians",
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* 1 — Hero */}
      <Hero />
      {/* 2 — Trust metrics */}
      <TrustStrip />
      {/* 3 — Featured services */}
      <FeaturedServices />
      {/* 4 — How it works / workflow */}
      <HowItWorks />
      {/* 5 — Booking journey */}
      <BookingJourney />
      {/* 6 — Top technicians */}
      <TopTechnicians />
      {/* 7 — CTA + About footer */}
      <LandingCta />
      <SiteFooter />
    </main>
  );
}
