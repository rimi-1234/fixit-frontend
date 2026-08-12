import type { Metadata } from "next";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FixItNow Privacy Policy — how we collect, use, and protect your personal information.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, including your name, email address, phone number, and payment information when you create an account or make a booking. We also automatically collect device data, IP addresses, and usage information through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to provide and improve our services, process payments, send booking confirmations and notifications, ensure platform safety, and comply with legal obligations. We do not sell your personal data to third parties.`,
  },
  {
    title: "3. Sharing Your Information",
    content: `We share necessary information with technicians when you make a booking (e.g., your name and contact details). We may share data with payment processors (Stripe, SSLCommerz) and analytics providers who are contractually bound to protect it.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your account data for as long as your account is active. Booking records are retained for 5 years for legal and accounting purposes. You may request deletion of your account and associated data at any time by contacting support.`,
  },
  {
    title: "5. Security",
    content: `We use industry-standard encryption (TLS) for data in transit and AES-256 for data at rest. Passwords are hashed using bcrypt. Despite our best efforts, no system is completely secure. Please use a strong, unique password.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your location, you may have rights to access, correct, delete, or export your personal data. You may also object to certain processing. Submit requests to support@fixitnow.com and we will respond within 30 days.`,
  },
  {
    title: "7. Cookies",
    content: `We use strictly necessary cookies for authentication (JWT) and optional analytics cookies to understand how our platform is used. You can control non-essential cookies through your browser settings.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the platform at least 30 days before changes take effect.`,
  },
  {
    title: "9. Contact",
    content: `For privacy-related questions, please contact our Data Protection Officer at privacy@fixitnow.com or write to FixItNow, 123 Service Lane, New York, NY 10001, USA.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border/50 bg-muted/25 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-3">
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Last updated: 1 August 2026
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          FixItNow (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the FixItNow platform. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our services.
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
