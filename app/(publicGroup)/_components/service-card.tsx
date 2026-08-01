import Link from "next/link";
import { Star } from "lucide-react";

import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { colorFromString, getInitials } from "@/utils/get-initials";

export function ServiceCard({ service }: { service: Service }) {
  const techEmail = service.technician?.email ?? "Technician";
  const rating = service.technician?.averageRating ?? 0;

  return (
    <li className="group">
      <Link
        href={
          service.technicianId
            ? `/technicians/${service.technicianId}`
            : "/services"
        }
        className="block space-y-3"
      >
        <div
          className="flex aspect-[4/3] items-end rounded-xl p-4 transition-transform group-hover:scale-[1.01]"
          style={{
            background: `linear-gradient(145deg, ${colorFromString(service.categoryId || service.id)}, oklch(0.96 0.01 240))`,
          }}
        >
          <span className="rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            {service.category?.name ?? "Service"}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium tracking-tight text-foreground group-hover:underline group-hover:underline-offset-4">
              {service.name}
            </h3>
            <p className="shrink-0 text-sm font-semibold">
              {formatCurrency(service.price)}
            </p>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span
              className="inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-foreground"
              style={{ background: colorFromString(techEmail) }}
            >
              {getInitials(techEmail)}
            </span>
            <span className="truncate">{techEmail}</span>
            <span className="inline-flex items-center gap-0.5">
              <Star aria-hidden="true" className="size-3 fill-current" />
              {rating > 0 ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}
