import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export type { BookingStatus };

// Deliberately limited to the app's semantic palette (warning / info / success /
// destructive / primary / neutral) instead of a different hue per status, so the
// badge palette stays disciplined and consistent with the rest of the UI.
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
    className: "bg-primary/10 text-primary",
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
    className: "bg-destructive/15 text-destructive",
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
