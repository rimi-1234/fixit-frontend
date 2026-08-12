import Link from "next/link";
import { CheckCircle2, Wrench } from "lucide-react";

import { AuthBackButton } from "@/app/(authGroup)/_components/auth-back-button";

const HIGHLIGHTS = [
  "Verified technicians across every category",
  "Pay only after the job is accepted",
  "Track requests from booking to completion",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-1 bg-background">
      <div className="flex w-full flex-1 flex-col lg:max-w-[54%]">
        <header className="flex items-center justify-between px-4 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-3.5" />
            </span>
            FixItNow
          </Link>
          <AuthBackButton />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-8">
          <div className="w-full max-w-md py-6">{children}</div>
        </main>
      </div>

      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80"
          alt="Technician completing a home repair"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-primary/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.18),transparent_55%)]" />
        <div className="relative space-y-5 p-10 text-primary-foreground xl:p-12">
          <p className="text-2xl font-semibold tracking-tight">FixItNow</p>
          <p className="max-w-sm text-base leading-relaxed text-primary-foreground/90">
            Home services, handled with confidence.
          </p>
          <ul className="space-y-2.5 text-sm text-primary-foreground/80">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
