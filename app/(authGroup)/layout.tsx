import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Wrench } from "lucide-react";

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
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col">
        <header className="px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <Wrench aria-hidden="true" className="size-4" />
            FixItNow
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      <div className="relative hidden w-[42%] shrink-0 overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80"
          alt="Technician completing a home repair"
          fill
          priority
          className="object-cover object-center"
          sizes="42vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 p-10 text-background">
          <p className="text-lg font-medium tracking-tight text-balance">
            Home services, handled with confidence.
          </p>
          <ul className="space-y-2 text-sm text-background/85">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
