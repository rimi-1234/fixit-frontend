import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Find answers to common questions about FixItNow services, bookings, payments, and more.",
};

const FAQS = [
  {
    category: "Bookings",
    items: [
      { q: "How do I book a service?", a: "Browse services or technicians, choose a slot that works for you, and confirm your booking. You'll receive a confirmation email with all the details." },
      { q: "Can I reschedule a booking?", a: "Yes, you can reschedule a confirmed booking up to 4 hours before the scheduled time. Go to your dashboard and select 'Reschedule' on the booking card." },
      { q: "How do I cancel a booking?", a: "Navigate to your dashboard, find the booking, and click 'Cancel'. Cancellations made more than 24 hours in advance receive a full refund." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards through Stripe, as well as SSLCommerz for local bank transfers in supported regions." },
      { q: "When am I charged?", a: "Payment is collected after the technician accepts your booking request. You are not charged until the job is confirmed." },
      { q: "How do refunds work?", a: "Approved refunds are processed to your original payment method within 5–10 business days, depending on your bank." },
    ],
  },
  {
    category: "Technicians",
    items: [
      { q: "How are technicians verified?", a: "All technicians go through an ID check, skills assessment, and background review before they can list services on FixItNow." },
      { q: "What if I'm unhappy with the work?", a: "Contact support within 48 hours of job completion and we'll arrange a free re-visit or a refund, depending on the situation." },
    ],
  },
  {
    category: "Account",
    items: [
      { q: "How do I update my profile?", a: "Log in and navigate to Dashboard → Profile. You can update your name, phone number, and profile picture from there." },
      { q: "I forgot my password. How do I reset it?", a: "Click 'Forgot password?' on the login page and we'll send a reset link to your registered email address." },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border/50 bg-muted/25 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-3">
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Support</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Help & Support</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Find quick answers to your questions, or reach out to our team.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        {FAQS.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight border-b border-border/60 pb-2">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border/60 bg-card px-4 py-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium list-none">
                    {item.q}
                    <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 rounded-2xl border border-border/60 bg-muted/40 p-6 text-center">
          <p className="text-sm font-medium">Can&apos;t find your answer?</p>
          <p className="mt-1 text-sm text-muted-foreground">Our support team is here to help.</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Contact support
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
