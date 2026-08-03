"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";

import { displayNameFromEmail } from "@/utils/display-name";
import { formatCurrency } from "@/utils/format-currency";
import type { TechnicianSummary } from "@/lib/types";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { technicianImageUrl } from "@/utils/technician-images";

export function TechnicianCard({
  tech,
}: {
  tech: TechnicianSummary;
  index?: number;
}) {
  const profile = tech.technicianProfile;
  const skills = profile?.skills?.slice(0, 3) ?? [];
  const name = displayNameFromEmail(tech.email);
  const photo = technicianImageUrl(tech);

  return (
    <Link href={`/technicians/${tech.id}`} className="group block space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized={shouldUnoptimizeImage(photo)}
        />
      </div>
      <div className="space-y-1">
        <h3 className="flex flex-wrap items-center gap-1.5 font-medium tracking-tight group-hover:underline group-hover:underline-offset-4">
          {name}
          <BadgeCheck
            aria-label="Verified"
            className="size-3.5 shrink-0 text-primary"
          />
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star aria-hidden="true" className="size-3.5 fill-current" />
          {tech.averageRating > 0
            ? `${tech.averageRating.toFixed(1)} · ${tech.reviewCount} reviews`
            : "New on FixItNow"}
          {profile?.location ? ` · ${profile.location}` : ""}
        </p>
        {profile?.hourlyRate ? (
          <p className="text-sm font-semibold">
            {formatCurrency(profile.hourlyRate)}
            <span className="font-normal text-muted-foreground">/hr</span>
          </p>
        ) : null}
        {skills.length > 0 ? (
          <p className="text-xs text-muted-foreground">{skills.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function TechnicianCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}
