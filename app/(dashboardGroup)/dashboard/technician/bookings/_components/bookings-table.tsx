"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquareText,
  Search,
  Wrench,
} from "lucide-react";
import { TechnicianLocationShare } from "@/components/technician-location-share";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTechnicianBookings,
  useUpdateTechnicianBookingStatus,
} from "@/hooks/use-technicians";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationBar } from "@/components/pagination-bar";
import type { Booking, BookingStatus } from "@/lib/types";
import type { TechnicianBookingActionStatus } from "@/service/technician.service";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";

type StatusFilter = "ALL" | "REQUESTED" | "ACTIVE" | "DONE";

const FILTERS: { id: StatusFilter; label: string; color?: string }[] = [
  { id: "ALL", label: "All" },
  { id: "REQUESTED", label: "Pending" },
  { id: "ACTIVE", label: "Active" },
  { id: "DONE", label: "Closed" },
];

const ACTIVE: BookingStatus[] = ["ACCEPTED", "PAID", "IN_PROGRESS"];
const DONE: BookingStatus[] = ["COMPLETED", "DECLINED", "CANCELLED"];

type PendingConfirm = {
  bookingId: string;
  status: TechnicianBookingActionStatus;
  serviceName?: string;
};

function matchesFilter(booking: Booking, filter: StatusFilter) {
  if (filter === "ALL") return true;
  if (filter === "REQUESTED") return booking.status === "REQUESTED";
  if (filter === "ACTIVE") return ACTIVE.includes(booking.status);
  return DONE.includes(booking.status);
}

function actionsFor(status: BookingStatus): {
  status: TechnicianBookingActionStatus;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
}[] {
  switch (status) {
    case "REQUESTED":
      return [
        {
          status: "ACCEPTED",
          label: "Accept",
          icon: <CheckCircle2 className="size-3.5" />,
        },
        {
          status: "DECLINED",
          label: "Decline",
          variant: "destructive",
        },
      ];
    case "PAID":
      return [
        {
          status: "IN_PROGRESS",
          label: "Start job",
          icon: <Wrench className="size-3.5" />,
        },
      ];
    case "IN_PROGRESS":
      return [
        {
          status: "COMPLETED",
          label: "Mark complete",
          icon: <CheckCircle2 className="size-3.5" />,
        },
      ];
    default:
      return [];
  }
}

function confirmCopy(pending: PendingConfirm | null) {
  if (!pending) {
    return {
      title: "",
      description: "",
      confirmLabel: "Confirm",
      tone: "default" as const,
    };
  }
  if (pending.status === "DECLINED") {
    return {
      title: "Decline this request?",
      description: pending.serviceName
        ? `"${pending.serviceName}" will be declined and the customer will be notified.`
        : "This booking request will be declined and the customer will be notified.",
      confirmLabel: "Decline booking",
      tone: "danger" as const,
    };
  }
  return {
    title: "Mark job as completed?",
    description: pending.serviceName
      ? `Confirm that "${pending.serviceName}" is finished. The customer can then leave a review.`
      : "Confirm that this job is finished. The customer can then leave a review.",
    confirmLabel: "Mark completed",
    tone: "success" as const,
  };
}

function avatarInitials(email?: string) {
  if (!email) return "?";
  const name = displayNameFromEmail(email);
  return name.slice(0, 2).toUpperCase();
}

function StatCard({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
      <span className={cn("text-2xl font-bold tabular-nums", accent)}>
        {count}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function BookingCard({
  booking,
  busy,
  onAction,
}: {
  booking: Booking;
  busy: boolean;
  onAction: (booking: Booking, status: TechnicianBookingActionStatus) => void;
}) {
  const actions = actionsFor(booking.status);
  const initials = avatarInitials(booking.customer?.email);
  const customerName = displayNameFromEmail(booking.customer?.email);

  return (
    <div className="group rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-primary/20">
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold tracking-tight">
              {booking.service?.name ?? "Service"}
            </p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {customerName}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden="true" />
              {formatDateTime(booking.scheduledTime)}
            </span>
            {typeof booking.service?.price === "number" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {formatCurrency(booking.service.price)}
              </span>
            )}
            {booking.referenceNumber && (
              <span className="font-mono text-[11px] text-muted-foreground/60">
                {booking.referenceNumber}
              </span>
            )}
          </div>
        </div>

        {/* Chevron hint */}
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>

      {/* Notes callout */}
      {booking.notes && (
        <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-2.5">
          <MessageSquareText
            className="mt-0.5 size-4 shrink-0 text-primary/70"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/60">
              Customer note
            </p>
            <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
              {booking.notes}
            </p>
          </div>
        </div>
      )}

      {/* Live location sharing — once paid or job started */}
      {(booking.status === "PAID" || booking.status === "IN_PROGRESS") && (
        <div className="mx-5 mb-4">
          <TechnicianLocationShare bookingId={booking.id} />
        </div>
      )}

      {/* Actions */}
      {(actions.length > 0 || booking.status === "ACCEPTED") && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-5 py-3">
          {actions.length > 0 ? (
            actions.map((action) => (
              <Button
                key={action.status}
                size="sm"
                className="rounded-full"
                variant={action.variant ?? "default"}
                disabled={busy}
                onClick={() => onAction(booking, action.status)}
              >
                {busy ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  action.icon
                )}
                {action.label}
              </Button>
            ))
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden="true" />
              Waiting for customer payment
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

export function TechnicianBookingsTable() {
  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
  } = useTechnicianBookings();
  const updateStatus = useUpdateTechnicianBookingStatus();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [confirming, setConfirming] = useState(false);

  const all = bookings ?? [];

  const stats = useMemo(
    () => ({
      pending: all.filter((b) => b.status === "REQUESTED").length,
      active: all.filter((b) => ACTIVE.includes(b.status)).length,
      done: all.filter((b) => DONE.includes(b.status)).length,
    }),
    [all]
  );

  const list = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all
      .filter((booking) => matchesFilter(booking, filter))
      .filter((booking) => {
        if (!query) return true;
        return [booking.service?.name, booking.customer?.email, booking.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice()
      .sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
      );
  }, [all, filter, search]);

  const { page, setPage, totalPages, paged } = usePagination(list, 8);

  const copy = confirmCopy(confirm);

  async function runAction(
    bookingId: string,
    status: TechnicianBookingActionStatus
  ) {
    setPendingId(bookingId);
    try {
      await updateStatus.mutateAsync({ bookingId, status });
    } catch {
      // toast in mutation
    } finally {
      setPendingId(null);
    }
  }

  function handleAction(
    booking: Booking,
    status: TechnicianBookingActionStatus
  ) {
    if (status === "DECLINED" || status === "COMPLETED") {
      setConfirm({
        bookingId: booking.id,
        status,
        serviceName: booking.service?.name,
      });
      return;
    }
    void runAction(booking.id, status);
  }

  async function handleConfirm() {
    if (!confirm) return;
    setConfirming(true);
    try {
      await runAction(confirm.bookingId, confirm.status);
      setConfirm(null);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !confirming) setConfirm(null);
        }}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.confirmLabel}
        tone={copy.tone}
        loading={confirming}
        onConfirm={handleConfirm}
      />

      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Accept requests, start paid jobs, and mark work complete.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/technician" />}
        >
          Overview
        </Button>
      </div>

      {/* Stats row */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Pending"
            count={stats.pending}
            accent="text-amber-500"
          />
          <StatCard
            label="Active"
            count={stats.active}
            accent="text-primary"
          />
          <StatCard
            label="Closed"
            count={stats.done}
            accent="text-muted-foreground"
          />
        </div>
      )}

      {/* Search + filter bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search service or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-full border border-border/60 bg-card pl-10 pr-4 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                filter === item.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
              {item.id !== "ALL" && !isLoading && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    filter === item.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {item.id === "REQUESTED"
                    ? stats.pending
                    : item.id === "ACTIVE"
                      ? stats.active
                      : stats.done}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load bookings"
          description="Check that the API is running, then try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filter === "ALL" ? "No bookings yet" : "Nothing in this filter"}
          description={
            filter === "ALL"
              ? "When customers request your services, they'll show up here."
              : "Try another filter to see more bookings."
          }
        />
      ) : (
        <div className="space-y-4">
          {paged.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              busy={pendingId === booking.id}
              onAction={handleAction}
            />
          ))}
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
