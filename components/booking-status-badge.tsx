import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export type { BookingStatus };

/** Spec-aligned status colors for the booking journey badges. */
const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Requested",
    className: "bg-warning/15 text-warning",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-info/15 text-info",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive",
  },
  PAID: {
    label: "Paid",
    className: "bg-[oklch(0.94_0.04_300)] text-[oklch(0.42_0.16_300)] dark:bg-[oklch(0.28_0.06_300)] dark:text-[oklch(0.82_0.08_300)]",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "bg-success/15 text-success",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-[oklch(0.94_0.04_20)] text-[oklch(0.38_0.14_20)] dark:bg-[oklch(0.28_0.06_20)] dark:text-[oklch(0.78_0.08_20)]",
  },
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        style.className,
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}
