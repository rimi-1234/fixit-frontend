"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBookings } from "@/hooks/use-bookings";
import { formatDateTime } from "@/utils/format-date";

export function CustomerReviewsPage() {
  const { data, isLoading, isError, refetch } = useMyBookings();
  const list = data ?? [];
  const awaiting = list.filter((b) => b.status === "COMPLETED" && !b.review);
  const reviewed = list.filter((b) => Boolean(b.review));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Reveal className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Reviews
        </h2>
        <p className="text-sm text-muted-foreground">
          Leave feedback on completed jobs and revisit past reviews.
        </p>
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-base font-semibold tracking-tight">
          Awaiting your review
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load reviews"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : awaiting.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed jobs are waiting for feedback.
          </p>
        ) : (
          <RevealGroup as="ul" className="divide-y divide-border/60">
            {awaiting.map((booking) => (
              <RevealItem
                key={booking.id}
                as="li"
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium tracking-tight">
                    {booking.service?.name ?? "Service"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.technician?.email ?? "Technician"}
                    {" · "}
                    {formatDateTime(booking.scheduledTime)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  nativeButton={false}
                  render={
                    <Link href={`/dashboard/customer/bookings/${booking.id}#review`} />
                  }
                >
                  Leave review
                </Button>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-base font-semibold tracking-tight">
          Past reviews
        </h3>
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : reviewed.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="After a job is completed, you can rate the technician here."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {reviewed.map((booking) => (
              <li key={booking.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium tracking-tight">
                    {booking.service?.name ?? "Service"}
                  </p>
                  <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Star aria-hidden="true" className="size-3.5 fill-current" />
                    {booking.review?.rating}/5
                  </p>
                </div>
                {booking.review?.comment ? (
                  <p className="text-sm text-muted-foreground">
                    {booking.review.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}
