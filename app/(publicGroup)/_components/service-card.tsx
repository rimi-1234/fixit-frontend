"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { serviceImageUrl } from "@/utils/service-images";
import { displayNameFromEmail } from "@/utils/display-name";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { technicianImageUrl } from "@/utils/technician-images";

export function ServiceCard({
  service,
}: {
  service: Service;
  floatDelay?: number;
}) {
  const techEmail = service.technician?.email ?? "Technician";
  const rating = service.technician?.averageRating ?? 0;
  const categoryName = service.category?.name ?? "Service";
  const imageSrc = serviceImageUrl(service);
  const techPhoto = technicianImageUrl({
    id: service.technician?.id ?? service.technicianId,
    email: techEmail,
    technicianProfile: service.technician?.technicianProfile,
  });
  const detailHref = `/services/${service.id}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <Link href={detailHref} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized={shouldUnoptimizeImage(imageSrc)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {categoryName}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <Link href={detailHref}>
              <h3 className="font-medium tracking-tight text-foreground hover:underline hover:underline-offset-4">
                {service.name}
              </h3>
            </Link>
            <p className="shrink-0 text-sm font-semibold">
              {formatCurrency(service.price)}
            </p>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative inline-block size-6 shrink-0 overflow-hidden rounded-full">
              <Image
                src={techPhoto}
                alt=""
                fill
                sizes="24px"
                className="object-cover"
                unoptimized={shouldUnoptimizeImage(techPhoto)}
              />
            </span>
            <span className="truncate">{displayNameFromEmail(techEmail)}</span>
            <span className="inline-flex items-center gap-0.5">
              <Star aria-hidden="true" className="size-3 fill-current" />
              {rating > 0 ? rating.toFixed(1) : "New"}
            </span>
          </div>

          <Link
            href={detailHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View details
            <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </div>
    </div>
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
