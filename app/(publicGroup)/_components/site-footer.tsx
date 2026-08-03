import Link from "next/link";
import { Mail, ShieldCheck, Wrench } from "lucide-react";

const EXPLORE = [
  { href: "/services", label: "Browse services" },
  { href: "/technicians", label: "Find technicians" },
  { href: "/#how-it-works", label: "How it works" },
];

const COMPANY = [
  { href: "/#about", label: "About FixItNow" },
  { href: "mailto:support@fixitnow.com", label: "Contact us" },
];

const ACCOUNT = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create an account" },
  { href: "/register", label: "Join as a technician" },
];

export function SiteFooter() {
  return (
    <footer id="about" className="scroll-mt-24 border-t border-border/60 bg-muted/25">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_repeat(3,0.7fr)]">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-3.5" />
            </span>
            FixItNow
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Browse home services, request a time, pay through the supported checkout
            flow, and follow each booking status in one place.
          </p>
          <a
            href="mailto:support@fixitnow.com"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail aria-hidden="true" className="size-4" />
            support@fixitnow.com
          </a>
        </div>

        <FooterColumn title="Explore" links={EXPLORE} />
        <FooterColumn title="Company" links={COMPANY} />
        <FooterColumn title="Account" links={ACCOUNT} />
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FixItNow. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
              Secure provider-based checkout
            </span>
            <Link href="/#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
