import type { Metadata } from "next";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FixItNow Terms of Service — the rules and conditions governing use of our platform.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using FixItNow, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part, you may not use our services.",
  },
  {
    title: "2. Eligibility",
    content: "You must be at least 18 years old to use FixItNow. By using our platform, you confirm you meet this requirement and have the legal capacity to enter into binding contracts.",
  },
  {
    title: "3. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use. FixItNow is not liable for losses resulting from unauthorized account access.",
  },
  {
    title: "4. Booking & Services",
    content: "FixItNow is a marketplace connecting customers with independent technicians. We do not directly employ technicians. Bookings constitute agreements between customers and technicians; FixItNow facilitates but is not a party to these agreements.",
  },
  {
    title: "5. Payments",
    content: "All prices are displayed in USD. Payments are processed by third-party providers (Stripe, SSLCommerz). By completing a booking, you authorise the charge. FixItNow charges a platform service fee that is included in the displayed price.",
  },
  {
    title: "6. Cancellations & Refunds",
    content: "Cancellations made more than 24 hours before the scheduled service are eligible for a full refund. Later cancellations may incur a fee. Refund decisions for disputed work are made at FixItNow's sole discretion.",
  },
  {
    title: "7. Prohibited Conduct",
    content: "You may not use FixItNow to violate any laws, impersonate others, post false information, attempt to bypass security measures, engage in price manipulation, or harass other users. Violations may result in immediate account termination.",
  },
  {
    title: "8. Limitation of Liability",
    content: "To the maximum extent permitted by law, FixItNow shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform, even if we have been advised of the possibility of such damages.",
  },
  {
    title: "9. Governing Law",
    content: "These Terms are governed by the laws of the State of New York, USA, without regard to conflict-of-law principles. Disputes shall be resolved in the courts of New York County.",
  },
  {
    title: "10. Changes to Terms",
    content: "We may revise these Terms at any time. Continued use of FixItNow after changes are posted constitutes acceptance of the new Terms. We will provide at least 14 days' notice of material changes.",
  },
];

export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border/50 bg-muted/25 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-3">
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Last updated: 1 August 2026
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          Please read these Terms of Service carefully before using FixItNow. These Terms govern your access to and use of our platform, including our website, mobile applications, and related services.
        </p>
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 text-base font-semibold tracking-tight">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
