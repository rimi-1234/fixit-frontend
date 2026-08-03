"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Float, fadeUp, staggerContainer } from "@/components/motion/reveal";

export function Hero() {
  return (
    <section id="home" className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Float distance={14} duration={9} className="absolute inset-[-3%]">
          <Image
            src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=2400&q=80"
            alt="Technician repairing home electrical equipment"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </Float>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:py-24"
      >
        <div className="max-w-xl space-y-6">
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold tracking-[0.18em] text-primary uppercase"
          >
            FixItNow
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
          >
            Book a trusted technician in minutes
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Browse verified home services, pick a time that works, and pay securely when your booking is accepted.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              size="lg"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              Browse services
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full bg-background/70 backdrop-blur-sm"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Get started
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
