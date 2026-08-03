import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

const STATUS_STYLES: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Paid",
    className: "bg-success/15 text-success",
  },
  PENDING: {
    label: "Pending",
    className: "bg-warning/15 text-warning",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

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
