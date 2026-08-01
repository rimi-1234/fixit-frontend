"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTechnicians } from "@/hooks/use-technicians";
import { colorFromString, getInitials } from "@/utils/get-initials";
import { formatCurrency } from "@/utils/format-currency";

export function TopTechnicians() {
  const { data, isLoading, isError, refetch } = useTechnicians();

  const top = [...(data ?? [])]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Top-rated technicians
        </h2>
        <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
          Professionals customers trust — skills, rates, and ratings in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
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
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((tech) => {
            const profile = tech.technicianProfile;
            const skills = profile?.skills?.slice(0, 3) ?? [];
            return (
              <li key={tech.id}>
                <Link href={`/technicians/${tech.id}`} className="group block space-y-3">
                  <div
                    className="flex size-14 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: colorFromString(tech.id) }}
                  >
                    {getInitials(tech.email)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium tracking-tight group-hover:underline group-hover:underline-offset-4">
                      {tech.email.split("@")[0]}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star aria-hidden="true" className="size-3.5 fill-current" />
                      {tech.averageRating > 0
                        ? `${tech.averageRating.toFixed(1)} · ${tech.reviewCount} reviews`
                        : "New on FixItNow"}
                    </p>
                    {profile?.hourlyRate ? (
                      <p className="text-sm text-muted-foreground">
                        From {formatCurrency(profile.hourlyRate)}/hr
                        {profile.location ? ` · ${profile.location}` : ""}
                      </p>
                    ) : null}
                    {skills.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {skills.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
