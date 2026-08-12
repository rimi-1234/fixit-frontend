"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  SectionHeader,
  fadeUp,
  staggerContainer,
} from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified trust",
    description:
      "Technicians are reviewed for skills, rates, and reliability before they appear in search.",
  },
  {
    icon: Sparkles,
    title: "Clear booking flow",
    description:
      "Request a time, get a response, pay after acceptance, and track the job without guesswork.",
  },
  {
    icon: HeartHandshake,
    title: "People-first support",
    description:
      "Built for homeowners and pros who want fewer phone calls and more predictable outcomes.",
  },
];

const FLOW = [
  {
    step: "01",
    title: "Customers",
    detail: "Compare services, request a slot, pay after acceptance, leave a review.",
  },
  {
    step: "02",
    title: "Technicians",
    detail: "Publish offers, manage availability, accept jobs, and get paid through checkout.",
  },
  {
    step: "03",
    title: "Admins",
    detail: "Keep categories, accounts, and booking health visible across the platform.",
  },
];

export function AboutContent() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Compact editorial intro — not a full-screen homepage banner */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.94_0.04_264)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.97_0.02_220)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,oklch(0.28_0.05_264)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.22_0.03_220)_0%,transparent_50%)]"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="page-container grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16"
        >
          <div className="space-y-6">
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase backdrop-blur-sm"
            >
              <Wrench aria-hidden="true" className="size-3.5" />
              About FixItNow
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              Home services, made simpler for everyone involved
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              FixItNow connects people who need reliable help with technicians
              who want a clear way to get booked, paid, and reviewed — without
              the chaos of scattered chats.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="rounded-full"
                  nativeButton={false}
                  render={<Link href="/services" />}
                >
                  Explore services
                  <ArrowRight aria-hidden="true" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Join the platform
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80"
                  alt="Technician completing an electrical repair"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 55vw, 28vw"
                />
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80"
                    alt="Professional home cleaning service"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 40vw, 20vw"
                  />
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
                  <CalendarCheck2
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                  <p className="mt-3 text-sm font-semibold tracking-tight">
                    Book · Track · Pay
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    One status path for every job on the platform.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="page-container py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:items-start">
          <Reveal className="space-y-3 lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Our story
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built around real home-service friction
            </h2>
          </Reveal>
          <Reveal className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Finding a trusted technician often means scattered chats, unclear
              pricing, and no shared status trail. FixItNow brings browsing,
              booking, payment, and follow-up into one calm workflow so both
              sides stay aligned.
            </p>
            <p>
              Customers can compare services and request a time. Technicians
              manage availability and jobs. Admins keep categories and accounts
              healthy. Everyone sees the same status path from request to done.
            </p>
            <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1400&q=80"
                alt="Plumber working carefully on a home repair"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border/50 bg-muted/25 py-14 sm:py-16">
        <div className="page-container">
          <SectionHeader
            eyebrow="What we value"
            title="A marketplace that stays practical"
            description="Fewer gimmicks. More clarity at every step of the job."
          />
          <RevealGroup className="grid gap-5 md:grid-cols-3">
            {VALUES.map((value) => (
              <RevealItem
                key={value.title}
                className="rounded-3xl border border-border/60 bg-background/80 p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <value.icon aria-hidden="true" className="size-4" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="page-container py-14 sm:py-16">
        <SectionHeader
          eyebrow="Who it serves"
          title="One place for every role"
          description="The same booking trail, tuned for how each side actually works."
        />
        <RevealGroup className="grid gap-4 sm:grid-cols-3">
          {FLOW.map((item) => (
            <RevealItem
              key={item.step}
              className="rounded-3xl border border-border/50 bg-card/40 p-5 sm:p-6"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="page-container pb-16 sm:pb-20">
        <Reveal className="overflow-hidden rounded-[1.75rem] bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready when your next home fix is
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/85 sm:text-base">
              Browse services now, or create an account and explore the dashboard
              for your role.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/services" />}
              >
                Browse services
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Try a demo role
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
