"use client";

import Image from "next/image";
import { CalendarDays, CreditCard, Search, Shield } from "lucide-react";

import {
  Float,
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";

const STEPS = [
  {
    number: "01",
    label: "Discover",
    title: "Compare the details that matter.",
    description:
      "Explore services and technician profiles by skill, location, rate, and reviews before you decide.",
    icon: Search,
    tint: "bg-info/15 text-info",
  },
  {
    number: "02",
    label: "Coordinate",
    title: "Make a clear booking request.",
    description:
      "Choose a service and preferred time, then follow the technician response without chasing updates.",
    icon: CalendarDays,
    tint: "bg-success/15 text-success",
  },
  {
    number: "03",
    label: "Complete",
    title: "Pay and review at the right moment.",
    description:
      "Checkout opens after acceptance. Track the job, then leave a review when the work is done.",
    icon: CreditCard,
    tint: "bg-warning/15 text-warning",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal className="space-y-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Built around the real workflow
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Less chasing. More clarity at every decision.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            FixItNow keeps finding professionals, agreeing on work, and finishing
            bookings in one visible path — so customers and technicians always know
            what comes next.
          </p>
          <div className="flex items-start gap-3 rounded-2xl bg-muted/60 px-4 py-3.5">
            <Shield aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Role-based accounts keep customer, technician, and admin actions separate.
            </p>
          </div>

          <Float distance={12} duration={6.5} className="relative mt-2 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
            <Image
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
              alt="Professional completing a home service"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </Float>
        </Reveal>

        <RevealGroup as="ol" className="space-y-0">
          {STEPS.map((step, index) => (
            <RevealItem
              key={step.number}
              as="li"
              className="relative grid grid-cols-[auto_1fr_auto] gap-4 border-b border-border/60 py-7 first:pt-0 last:border-b-0 last:pb-0"
            >
              <Float distance={6} duration={4.5} delay={index * 0.25}>
                <span
                  className={`mt-0.5 inline-flex size-10 items-center justify-center rounded-full ${step.tint}`}
                >
                  <step.icon aria-hidden="true" className="size-4" />
                </span>
              </Float>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {step.label}
                </p>
                <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                  {step.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="hidden text-4xl font-semibold tracking-tight text-muted/80 sm:block"
              >
                {step.number}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
