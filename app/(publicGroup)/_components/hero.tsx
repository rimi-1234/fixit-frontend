import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=2400&q=80"
        alt="Technician repairing home electrical equipment"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-foreground uppercase">
            FixItNow
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Book a trusted technician in minutes
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse verified home services, pick a time that works, and pay securely when your booking is accepted.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button size="lg" nativeButton={false} render={<Link href="/services" />}>
              Browse services
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/register" />}
              className="bg-background/70 backdrop-blur-sm"
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
