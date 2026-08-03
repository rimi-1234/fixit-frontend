"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { avatarFromString } from "@/utils/get-initials";

const CATEGORY_IMAGES: Record<string, string> = {
  plumbing:
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  ac: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  painting:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
  default:
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
};

function imageForCategory(name?: string) {
  const key = (name ?? "").toLowerCase();
  if (key.includes("plumb")) return CATEGORY_IMAGES.plumbing;
  if (key.includes("electric")) return CATEGORY_IMAGES.electrical;
  if (key.includes("clean")) return CATEGORY_IMAGES.cleaning;
  if (key.includes("ac") || key.includes("air") || key.includes("hvac")) {
    return CATEGORY_IMAGES.ac;
  }
  if (key.includes("paint")) return CATEGORY_IMAGES.painting;
  return CATEGORY_IMAGES.default;
}

export function ServiceCard({
  service,
}: {
  service: Service;
  floatDelay?: number;
}) {
  const techEmail = service.technician?.email ?? "Technician";
  const rating = service.technician?.averageRating ?? 0;
  const categoryName = service.category?.name ?? "Service";

  return (
    <Link
      href={
        service.technicianId
          ? `/technicians/${service.technicianId}`
          : "/services"
      }
      className="group block space-y-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={imageForCategory(categoryName)}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {categoryName}
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
          <span className="relative inline-block size-6 shrink-0 overflow-hidden rounded-full">
            <Image
              src={avatarFromString(techEmail)}
              alt=""
              fill
              sizes="24px"
              className="object-cover"
            />
          </span>
          <span className="truncate">{techEmail}</span>
          <span className="inline-flex items-center gap-0.5">
            <Star aria-hidden="true" className="size-3 fill-current" />
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}
