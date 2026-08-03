"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import {
  TechnicianCard,
  TechnicianCardSkeleton,
} from "@/app/(publicGroup)/_components/technician-card";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useTechnicians } from "@/hooks/use-technicians";
import type { TechnicianFilters } from "@/service/technician.service";
import { applyTechnicianFilters } from "@/utils/apply-technician-filters";

function useDebouncedTechnicianFilters(
  skill: string,
  location: string,
  minRating: string,
  delayMs = 250
): TechnicianFilters {
  const draft = useMemo(() => {
    const next: TechnicianFilters = {};
    if (skill.trim()) next.skill = skill.trim();
    if (location.trim()) next.location = location.trim();
    if (minRating) next.minRating = Number(minRating);
    return next;
  }, [skill, location, minRating]);

  const [filters, setFilters] = useState(draft);

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters(draft), delayMs);
    return () => window.clearTimeout(timer);
  }, [draft, delayMs]);

  return filters;
}

export function TechniciansBrowse() {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");

  const filters = useDebouncedTechnicianFilters(skill, location, minRating);

  // Load the full list, then filter in the UI so skill matching is partial + case-insensitive
  // even when a deployed API still uses exact Prisma `has`.
  const { data, isLoading, isError, isFetching, refetch } = useTechnicians();

  const technicians = useMemo(() => {
    return applyTechnicianFilters(data ?? [], filters).sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
    );
  }, [data, filters]);

  const hasFilters = Boolean(skill || location || minRating);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Top-rated professionals
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Filter by skill, location, and rating to find the right technician.
            {isFetching && !isLoading ? " Updating…" : ""}
          </p>
        </div>

        <div className="mb-10 grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="tech-skill">Skill</Label>
            <Input
              id="tech-skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Plumbing, Electrical…"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tech-location">Location</Label>
            <Input
              id="tech-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dhaka"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tech-rating">Min rating</Label>
            <select
              id="tech-rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full"
              disabled={!hasFilters}
              onClick={() => {
                setSkill("");
                setLocation("");
                setMinRating("");
              }}
            >
              Clear filters
            </Button>
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
            title={hasFilters ? "No technicians match" : "No technicians yet"}
            description={
              hasFilters
                ? "Try clearing filters or broadening your search."
                : "Be the first to offer services on FixItNow."
            }
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSkill("");
                    setLocation("");
                    setMinRating("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button nativeButton={false} render={<Link href="/register" />}>
                  Join as a technician
                </Button>
              )
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
