"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";

import { Float } from "@/components/motion/reveal";
import { avatarFromString } from "@/utils/get-initials";
import { formatCurrency } from "@/utils/format-currency";
import type { TechnicianSummary } from "@/lib/types";

export function TechnicianCard({
  tech,
  index = 0,
}: {
  tech: TechnicianSummary;
  index?: number;
}) {
  const profile = tech.technicianProfile;
  const skills = profile?.skills?.slice(0, 3) ?? [];

  return (
    <Link href={`/technicians/${tech.id}`} className="group block space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Float
          distance={9}
          duration={5.2 + index * 0.4}
          delay={index * 0.3}
          className="absolute inset-0"
        >
          <div className="absolute inset-[-10%]">
            <Image
              src={avatarFromString(tech.id)}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Float>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          <BadgeCheck aria-hidden="true" className="size-3.5 text-primary" />
          Verified
        </span>
        {profile?.hourlyRate ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur-sm">
            {formatCurrency(profile.hourlyRate)}/hr
          </span>
        ) : null}
      </div>
      <div className="space-y-1">
        <h3 className="font-medium tracking-tight group-hover:underline group-hover:underline-offset-4">
          {tech.email.split("@")[0]}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star aria-hidden="true" className="size-3.5 fill-current" />
          {tech.averageRating > 0
            ? `${tech.averageRating.toFixed(1)} · ${tech.reviewCount} reviews`
            : "New on FixItNow"}
          {profile?.location ? ` · ${profile.location}` : ""}
        </p>
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
