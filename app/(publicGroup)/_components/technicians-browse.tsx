"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import {
  TechnicianCard,
  TechnicianCardSkeleton,
} from "@/app/(publicGroup)/_components/technician-card";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useTechnicians } from "@/hooks/use-technicians";

export function TechniciansBrowse() {
  const { data, isLoading, isError, refetch } = useTechnicians();

  const technicians = [...(data ?? [])].sort(
    (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Top-rated professionals
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Skilled, verified, and ready to help.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TechnicianCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="Couldn't load technicians"
            description="Check that the FixItNow API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : technicians.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No technicians yet"
            description="Be the first to offer services on FixItNow."
            action={
              <Button nativeButton={false} render={<Link href="/register" />}>
                Join as a technician
              </Button>
            }
          />
        ) : (
          <RevealGroup
            as="ul"
            animate="visible"
            className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {technicians.map((tech, index) => (
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
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </div>
  );
}
