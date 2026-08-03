"use client";

import Link from "next/link";

import {
  TechnicianCard,
  TechnicianCardSkeleton,
} from "@/app/(publicGroup)/_components/technician-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  RevealGroup,
  RevealItem,
  SectionHeader,
} from "@/components/motion/reveal";
import { useTechnicians } from "@/hooks/use-technicians";

/** Landing section — same card design as /technicians. */
export function TopTechnicians() {
  const { data, isLoading, isError, refetch } = useTechnicians();

  const top = [...(data ?? [])]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  return (
    <section
      id="professionals"
      className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <SectionHeader
        title="Top-rated professionals"
        description="Skilled, verified, and ready to help."
        action={
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/technicians" />}
          >
            View all
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TechnicianCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load technicians"
          description="Check that the API is running, then try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : top.length === 0 ? (
        <EmptyState
          title="No technicians yet"
          description="Be the first to offer services on FixItNow."
        />
      ) : (
        <RevealGroup
          as="ul"
          animate="visible"
          className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {top.map((tech, index) => (
            <RevealItem
              key={tech.id}
              as="li"
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <TechnicianCard tech={tech} index={index} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
