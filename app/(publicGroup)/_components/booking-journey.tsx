"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hammer,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Float,
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";

const JOURNEY = [
  {
    status: "Requested",
    title: "Send your request",
    description: "Pick a service and preferred time slot.",
    icon: Send,
  },
  {
    status: "Accepted",
    title: "Get confirmation",
    description: "The technician reviews and accepts the job.",
    icon: Clock3,
  },
  {
    status: "Paid",
    title: "Complete checkout",
    description: "Pay securely only after acceptance.",
    icon: CreditCard,
  },
  {
    status: "In progress",
    title: "Follow the status",
    description: "Track work from start through completion.",
    icon: Hammer,
  },
  {
    status: "Completed",
    title: "Close the loop",
    description: "Leave a review once the job is done.",
    icon: CheckCircle2,
  },
];

export function BookingJourney() {
  return (
    <section id="journey" className="scroll-mt-24 overflow-hidden bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-14">
        <Reveal className="relative space-y-5">
          <Float
            distance={16}
            duration={7}
            className="pointer-events-none absolute -right-6 -top-4 hidden size-28 overflow-hidden rounded-2xl shadow-lg md:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80"
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          </Float>

          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            A transparent booking journey
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One booking. Every next step visible.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Customers and technicians share the same clear status flow — from the
            first request through payment, work, and review.
          </p>

          <div className="flex items-start gap-3 border-l-2 border-primary/40 bg-background/60 py-3 pl-4">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-success"
            />
            <p className="text-sm text-muted-foreground">
              Payment opens after acceptance. Reviews unlock when the job is completed.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/#how-it-works" />}
          >
            See how booking works
            <ArrowRight aria-hidden="true" />
          </Button>
        </Reveal>

        <Reveal className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <Float
            distance={10}
            duration={6}
            delay={0.4}
            className="pointer-events-none absolute -bottom-8 -right-6 hidden size-24 overflow-hidden rounded-2xl opacity-90 shadow-md md:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80"
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </Float>

          <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Booking journey
              </p>
              <p className="text-lg font-semibold tracking-tight">
                From request to review
              </p>
            </div>
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
              Clear status flow
            </span>
          </div>

          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
            {JOURNEY.map((step, index) => (
              <RevealItem key={step.status} className="relative space-y-3">
                {index < JOURNEY.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 left-[calc(50%+1.25rem)] hidden h-px w-[calc(100%-0.5rem)] bg-border lg:block"
                  />
                ) : null}
                <Float distance={5} duration={4 + index * 0.2} delay={index * 0.15}>
                  <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon aria-hidden="true" className="size-4" />
                  </span>
                </Float>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {step.status}
                  </p>
                  <p className="text-sm font-semibold tracking-tight">
                    {step.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      </div>
    </section>
  );
}
