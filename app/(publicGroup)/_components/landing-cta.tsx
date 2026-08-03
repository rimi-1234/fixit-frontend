"use client";

import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Float, Reveal } from "@/components/motion/reveal";

export function LandingCta() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <Reveal className="relative mx-auto flex max-w-6xl flex-col gap-8 overflow-hidden rounded-[1.75rem] bg-primary px-8 py-10 text-primary-foreground sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
        <Float
          distance={18}
          duration={7}
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary-foreground/10 blur-2xl"
        >
          <span className="block size-full" />
        </Float>
        <Float
          distance={14}
          duration={8}
          delay={0.8}
          className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-primary-foreground/8 blur-3xl"
        >
          <span className="block size-full" />
        </Float>

        <div className="relative max-w-xl space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary-foreground/75 uppercase">
            <Wrench aria-hidden="true" className="size-3.5" />
            A better way to handle home tasks
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Find the right help and keep every booking step clear.
          </h2>
        </div>

        <div className="relative flex flex-wrap gap-3">
          <Button
            size="lg"
            className="rounded-full bg-background text-foreground hover:bg-background/90"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Browse services
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Join as a technician
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
