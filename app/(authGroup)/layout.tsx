import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Wrench } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="relative flex min-h-full flex-1 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,oklch(0.94_0.04_264)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.02_220)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,oklch(0.28_0.05_264)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.24_0.03_220)_0%,transparent_50%)] lg:hidden"
      />

      <div className="flex flex-1 flex-col">
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
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      <div className="relative hidden w-[46%] shrink-0 overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1600&q=80"
          alt="Technician completing a home repair"
          fill
          priority
          className="object-cover object-center"
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10" />
        <div className="absolute inset-x-0 bottom-0 space-y-5 p-10 text-background xl:p-12">
          <p className="text-2xl font-semibold tracking-tight text-balance">
            FixItNow
          </p>
          <p className="max-w-sm text-base leading-relaxed text-background/90 text-balance">
            Home services, handled with confidence.
          </p>
          <ul className="space-y-2.5 text-sm text-background/80">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
