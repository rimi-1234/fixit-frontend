import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-muted/40 px-4 py-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {Icon ? (
          <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
        ) : null}
      </div>
    </div>
  );
}
