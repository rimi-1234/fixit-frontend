import Link from "next/link";
import { Mail, Phone, ShieldCheck, Wrench } from "lucide-react";

function TwitterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.027 4.388 11.022 10.124 11.927v-8.43H7.078v-3.497h3.046V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.967H15.83c-1.49 0-1.953.927-1.953 1.878v2.255h3.328l-.532 3.497H13.877v8.43C19.612 23.095 24 18.1 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const EXPLORE = [
  { href: "/services", label: "Browse services" },
  { href: "/technicians", label: "Find technicians" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About FixItNow" },
];

const COMPANY = [
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact us" },
  { href: "/help", label: "Help & Support" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const ACCOUNT = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create an account" },
  { href: "/register?role=technician", label: "Join as a technician" },
];

const SOCIALS = [
  { href: "https://twitter.com", label: "Twitter", Icon: TwitterIcon },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://youtube.com", label: "YouTube", Icon: YoutubeIcon },
];

export function SiteFooter() {
  return (
    <footer className="scroll-mt-24 border-t border-border/60 bg-muted/25">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-[1.4fr_repeat(3,0.8fr)] lg:gap-10">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-3.5" />
            </span>
            FixItNow
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Book trusted home service technicians in minutes. Pay securely, track your job, and leave a review — all in one place.
          </p>
          <div className="space-y-1.5">
            <a
              href="mailto:support@fixitnow.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail aria-hidden="true" className="size-4 shrink-0" />
              support@fixitnow.com
            </a>
            <a
              href="tel:+18005555555"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Phone aria-hidden="true" className="size-4 shrink-0" />
              +1 (800) 555-5555
            </a>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
              >
                <Icon />
              </a>
            ))}
          </div>
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
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
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
