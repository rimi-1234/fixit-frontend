"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  MessageSquareQuote,
  Star,
  Sparkles,
} from "lucide-react";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyBookings } from "@/hooks/use-bookings";
import { usePagination } from "@/hooks/use-pagination";
import { displayNameFromEmail } from "@/utils/display-name";
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const list = data ?? [];
  const awaiting = list.filter((b) => b.status === "COMPLETED" && !b.review);
  const reviewed = list.filter((b) => Boolean(b.review));
  const rows = useMemo(() => {
    const source =
      filter === "awaiting" ? awaiting : filter === "submitted" ? reviewed : [...awaiting, ...reviewed];
    const query = search.trim().toLowerCase();
    return source.filter((booking) => {
      if (!query) return true;
      const haystack = [
        booking.service?.name,
        booking.technician?.email,
        booking.review?.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [awaiting, reviewed, filter, search]);
  const { page, setPage, totalPages, paged } = usePagination(rows, 8);
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

      <Reveal className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="mb-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Reviews
            </h3>
            <p className="text-sm text-muted-foreground">
              Filter awaiting and submitted feedback.
            </p>
          </div>
          <FilterBar>
            <FilterSearch
              id="reviews-search"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Service, technician, comment…"
            />
            <FilterSelect
              id="reviews-filter"
              label="Type"
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All" },
                { value: "awaiting", label: "Awaiting review" },
                { value: "submitted", label: "Submitted" },
              ]}
            />
          </FilterBar>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
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
        ) : awaiting.length === 0 && reviewed.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="After a job is completed, you can rate the technician here."
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No matching reviews"
            description="Try another search or filter."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.service?.name ?? "Service"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.technician?.email
                        ? displayNameFromEmail(booking.technician.email)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {booking.review ? (
                        <div className="flex items-center gap-2">
                          <StarRow rating={booking.review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {booking.review.rating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                      {booking.review?.comment || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={booking.review ? "outline" : "default"}
                        className="rounded-full"
                        nativeButton={false}
                        render={
                          <Link
                            href={
                              booking.review
                                ? `/dashboard/customer/bookings/${booking.id}`
                                : `/dashboard/customer/bookings/${booking.id}#review`
                            }
                          />
                        }
                      >
                        {booking.review ? "Open" : "Leave review"}
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Reveal>
    </div>
  );
}
