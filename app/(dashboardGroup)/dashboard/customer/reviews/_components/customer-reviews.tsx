"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageSquareQuote,
  Star,
  Sparkles,
} from "lucide-react";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBookings } from "@/hooks/use-bookings";
import { displayNameFromEmail } from "@/utils/display-name";
import { formatDateTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              "size-3.5",
              filled
                ? "fill-warning text-warning"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        );
      })}
    </span>
  );
}

export function CustomerReviewsPage() {
  const { data, isLoading, isError, refetch } = useMyBookings();
  const list = data ?? [];
  const awaiting = list.filter((b) => b.status === "COMPLETED" && !b.review);
  const reviewed = list.filter((b) => Boolean(b.review));
  const avgRating =
    reviewed.length > 0
      ? reviewed.reduce((sum, b) => sum + (b.review?.rating ?? 0), 0) /
        reviewed.length
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-gradient-to-br from-accent/45 via-card to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -top-20 left-1/3 size-52 rounded-full bg-warning/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              Feedback
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Reviews
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Rate completed jobs and keep a clear record of the feedback you’ve
              shared with technicians.
            </p>
          </div>
          {awaiting.length > 0 ? (
            <Button
              className="rounded-full"
              nativeButton={false}
              render={
                <Link
                  href={`/dashboard/customer/bookings/${awaiting[0].id}#review`}
                />
              }
            >
              <Sparkles aria-hidden="true" />
              Review next job
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-full bg-background/70"
              nativeButton={false}
              render={<Link href="/dashboard/customer/bookings" />}
            >
              View bookings
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <RevealItem>
              <StatTile
                label="Awaiting review"
                value={awaiting.length}
                hint="Completed jobs to rate"
                icon={Sparkles}
                iconClassName="bg-warning/15 text-warning"
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Reviews left"
                value={reviewed.length}
                hint="Feedback submitted"
                icon={MessageSquareQuote}
                iconClassName="bg-primary/10 text-primary"
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Your average"
                value={reviewed.length ? `${avgRating.toFixed(1)}/5` : "—"}
                hint="Across past reviews"
                icon={Star}
                iconClassName="bg-success/15 text-success"
              />
            </RevealItem>
          </>
        )}
      </RevealGroup>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-1">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Awaiting your review
            </h3>
            <p className="text-sm text-muted-foreground">
              Completed jobs that still need your rating.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/25 px-5 py-8">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                <Star aria-hidden="true" className="size-4 fill-current" />
              </span>
              <div className="space-y-1">
                <p className="font-medium tracking-tight">You’re all caught up</p>
                <p className="text-sm text-muted-foreground">
                  No completed jobs are waiting for feedback right now.
                </p>
              </div>
            </div>
          ) : (
            <RevealGroup as="ul" animate="visible" className="grid gap-3">
              {awaiting.map((booking) => (
                <RevealItem
                  key={booking.id}
                  as="li"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/25 hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-semibold tracking-tight">
                      {booking.service?.name ?? "Service"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.technician?.email
                        ? displayNameFromEmail(booking.technician.email)
                        : "Technician"}
                      {" · "}
                      {formatDateTime(booking.scheduledTime)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/dashboard/customer/bookings/${booking.id}#review`}
                      />
                    }
                  >
                    Leave review
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </Reveal>

        <Reveal className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-1">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Past reviews
            </h3>
            <p className="text-sm text-muted-foreground">
              Feedback you’ve already submitted.
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : reviewed.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="After a job is completed, you can rate the technician here."
            />
          ) : (
            <RevealGroup as="ul" animate="visible" className="grid gap-3">
              {reviewed.map((booking) => (
                <RevealItem
                  key={booking.id}
                  as="li"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/20 hover:bg-accent/25 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold tracking-tight">
                        {booking.service?.name ?? "Service"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.technician?.email
                          ? displayNameFromEmail(booking.technician.email)
                          : "Technician"}
                        {booking.review?.createdAt
                          ? ` · ${formatDateTime(booking.review.createdAt)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-muted/60 px-2.5 py-1">
                      <StarRow rating={booking.review?.rating ?? 0} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {booking.review?.rating}/5
                      </span>
                    </div>
                  </div>
                  {booking.review?.comment ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      “{booking.review.comment}”
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/80 italic">
                      No written comment
                    </p>
                  )}
                  <Link
                    href={`/dashboard/customer/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Open booking
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </Reveal>
      </div>
    </div>
  );
}
