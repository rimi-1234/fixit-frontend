import { cn } from "@/lib/utils";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Requested",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
  PAID: {
    label: "Paid",
    className: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-200 text-rose-900 dark:bg-rose-500/20 dark:text-rose-400",
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
