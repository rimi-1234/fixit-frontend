"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/components/motion/reveal";

const BACKGROUNDS = [
  {
    id: "electrical",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=2400&q=80",
    alt: "Technician repairing home electrical equipment",
  },
  {
    id: "cleaning",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2400&q=80",
    alt: "Professional cleaning and home maintenance",
  },
  {
    id: "plumbing",
    image:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2400&q=80",
    alt: "Technician working on plumbing repair",
  },
] as const;

/** Rotating typed word — keep similar lengths for a stable hero. */
const TYPING_WORDS = ["trusted", "verified", "skilled", "nearby"] as const;

const BG_ROTATE_MS = 6500;
const TYPE_MS = 78;
const DELETE_MS = 42;
const HOLD_MS = 1600;

function longestWord(words: readonly string[]) {
  return words.reduce((a, b) => (a.length >= b.length ? a : b));
}

function TypedWord({ words }: { words: readonly string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const reserve = longestWord(words);
  const current = words[wordIndex] ?? words[0];

  useEffect(() => {
    const full = current ?? "";

    if (!deleting && text === full) {
      const hold = window.setTimeout(() => setDeleting(true), HOLD_MS);
      return () => window.clearTimeout(hold);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const delay = deleting ? DELETE_MS : TYPE_MS;
    const tick = window.setTimeout(() => {
      setText((prev) =>
        deleting
          ? full.slice(0, Math.max(0, prev.length - 1))
          : full.slice(0, prev.length + 1)
      );
    }, delay);

    return () => window.clearTimeout(tick);
  }, [current, deleting, text, words.length]);

  return (
    <span
      className="relative inline-block align-baseline text-primary"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Invisible longest word locks width so typing never shifts the headline */}
      <span className="invisible whitespace-pre" aria-hidden="true">
        {reserve}
        {/* room for blinking caret */}
        <span className="inline-block w-[0.12em]" />
      </span>

      {/* Typed text + caret sit at the start and grow/shrink with the characters */}
      <span className="absolute inset-y-0 left-0 flex items-center whitespace-pre">
        <span>{text}</span>
        <motion.span
          aria-hidden="true"
          className="ml-[0.06em] inline-block h-[0.85em] w-[0.1em] rounded-[1px] bg-current"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.48, 0.52, 1],
          }}
        />
      </span>
    </span>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const slide = BACKGROUNDS[index] ?? BACKGROUNDS[0];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % BACKGROUNDS.length);
    }, BG_ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="home"
      className="relative isolate min-h-[62svh] max-h-[72svh] overflow-hidden"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/25" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto flex min-h-[62svh] max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:py-16"
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
            Book a <TypedWord words={TYPING_WORDS} /> technician in minutes
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Browse verified home services, pick a time that works, and pay
            securely when your booking is accepted.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <Button
                size="lg"
                className="rounded-full shadow-lg shadow-primary/20"
                nativeButton={false}
                render={<Link href="/services" />}
              >
                Browse services
                <motion.span
                  aria-hidden="true"
                  className="inline-flex"
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight />
                </motion.span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
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
          </motion.div>
        </div>

        <div
          className="absolute bottom-8 left-4 flex items-center gap-2 sm:left-6"
          aria-hidden="true"
        >
          {BACKGROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="relative h-1 overflow-hidden rounded-full bg-foreground/15 transition-[width] duration-300"
              style={{ width: i === index ? 28 : 10 }}
            >
              {i === index ? (
                <motion.span
                  key={`progress-${item.id}-${index}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: BG_ROTATE_MS / 1000, ease: "linear" }}
                />
              ) : null}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
