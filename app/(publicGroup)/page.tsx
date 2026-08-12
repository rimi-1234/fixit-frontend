import type { Metadata } from "next";

import { BookingJourney } from "@/app/(publicGroup)/_components/booking-journey";
import { FeaturedServices } from "@/app/(publicGroup)/_components/featured-services";
import { Hero } from "@/app/(publicGroup)/_components/hero";
import { HowItWorks } from "@/app/(publicGroup)/_components/how-it-works";
import { LandingCta } from "@/app/(publicGroup)/_components/landing-cta";
import { PartnersMarquee } from "@/app/(publicGroup)/_components/partners-marquee";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Testimonials } from "@/app/(publicGroup)/_components/testimonials";
import { TopTechnicians } from "@/app/(publicGroup)/_components/top-technicians";

export const metadata: Metadata = {
  title: "Book Trusted Home Service Technicians",
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <PartnersMarquee />
      <FeaturedServices />
      <HowItWorks />
      <BookingJourney />
      <TopTechnicians />
      <Testimonials />
      <LandingCta />
      <SiteFooter />
    </main>
  );
}
