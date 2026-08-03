"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared entrance motion so every section/card animates in with the same feel. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Wrap a list/grid container with this, then each child in <RevealItem>. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const TAGS = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
  header: motion.header,
  ul: motion.ul,
  ol: motion.ol,
} as const;

type Tag = keyof typeof TAGS;

type RevealProps<T extends Tag> = ComponentProps<(typeof TAGS)[T]> & {
  as?: T;
};

/** Fades + slides an element up once it scrolls into view. Use for standalone blocks. */
export function Reveal<T extends Tag = "div">({
  as,
  children,
  ...props
}: RevealProps<T>) {
  const MotionTag = TAGS[(as ?? "div") as Tag] as ElementType;
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/** Parent for staggered reveals — pairs with <RevealItem> children. */
export function RevealGroup<T extends Tag = "div">({
  as,
  children,
  ...props
}: RevealProps<T>) {
  const MotionTag = TAGS[(as ?? "div") as Tag] as ElementType;
  // Prefer whileInView when caller doesn't pass animate; use amount 0 so
  // already-visible lists (e.g. after skeleton → data) still reveal.
  const usesWhileInView = props.animate === undefined && props.whileInView === undefined;
  return (
    <MotionTag
      initial="hidden"
      {...(usesWhileInView
        ? {
            whileInView: "visible",
            viewport: { once: true, amount: 0.05, margin: "0px 0px -40px 0px" },
          }
        : {})}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/** Child of <RevealGroup> — inherits stagger timing from the parent's variants. */
export function RevealItem<T extends Tag = "div">({
  as,
  children,
  ...props
}: RevealProps<T>) {
  const MotionTag = TAGS[(as ?? "div") as Tag] as ElementType;
  return (
    <MotionTag variants={fadeUp} {...props}>
      {children}
    </MotionTag>
  );
}

type FloatProps = {
  children: ReactNode;
  className?: string;
  /** Amplitude of the float in px. */
  distance?: number;
  /** Cycle duration in seconds. */
  duration?: number;
  /** Delay so multiple floats feel organic. */
  delay?: number;
};

/** Gentle continuous float — use on images, orbs, and decorative media. */
export function Float({
  children,
  className,
  distance = 10,
  duration = 5,
  delay = 0,
}: FloatProps) {
  return (
    <motion.div
      className={cn(className)}
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Shared section header used across landing blocks for consistent hierarchy. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="max-w-xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </Reveal>
  );
}
