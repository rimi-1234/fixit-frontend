"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  MapPin,
  Star,
} from "lucide-react";

import { BookNowPanel } from "@/app/(publicGroup)/_components/book-now-panel";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Float,
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { useTechnician } from "@/hooks/use-technicians";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { avatarFromString } from "@/utils/get-initials";

export function TechnicianProfileView({ technicianId }: { technicianId: string }) {
  const { data, isLoading, isError, refetch } = useTechnician(technicianId);

  if (isLoading) {
    return <TechnicianProfileSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="mx-auto flex max-w-6xl flex-1 flex-col px-4 py-16 sm:px-6">
        <EmptyState
          title="Technician not found"
          description="This profile may have been removed, or the API is offline."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button nativeButton={false} render={<Link href="/technicians" />}>
                Browse technicians
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const profile = data.technicianProfile;
  const displayName = data.email.split("@")[0] ?? data.email;
  const skills = profile?.skills ?? [];
  const reviews = data.reviews ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Reveal className="mb-8">
          <Link
            href="/technicians"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to professionals
          </Link>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="space-y-12 pb-28 lg:pb-0">
            <Reveal className="space-y-6">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <div className="relative aspect-[21/9] min-h-40 sm:min-h-48">
                  <Float distance={10} duration={7} className="absolute inset-0">
                    <div className="absolute inset-[-6%]">
                      <Image
                        src={avatarFromString(data.id)}
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </Float>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <div className="relative -mt-14 flex flex-col gap-5 px-1 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative mx-auto size-24 shrink-0 overflow-hidden rounded-full ring-4 ring-background sm:mx-0 sm:size-28">
                    <Image
                      src={avatarFromString(data.id)}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3 text-center sm:pb-1 sm:text-left">
                    <div className="space-y-2">
                      <h1 className="flex flex-wrap items-center justify-center gap-2 text-3xl font-semibold tracking-tight capitalize sm:justify-start">
                        {displayName}
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground normal-case">
                          <BadgeCheck aria-hidden="true" className="size-3.5" />
                          Verified
                        </span>
                      </h1>
                      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                        <span className="inline-flex items-center gap-1">
                          <Star aria-hidden="true" className="size-3.5 fill-current" />
                          {data.averageRating > 0
                            ? `${data.averageRating.toFixed(1)} · ${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"}`
                            : "New on FixItNow"}
                        </span>
                        {profile?.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin aria-hidden="true" className="size-3.5" />
                            {profile.location}
                          </span>
                        ) : null}
                        {typeof profile?.experience === "number" ? (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase aria-hidden="true" className="size-3.5" />
                            {profile.experience} yrs
                          </span>
                        ) : null}
                      </p>
                    </div>

                    {profile?.hourlyRate ? (
                      <p className="text-sm font-semibold text-foreground">
                        From {formatCurrency(profile.hourlyRate)}
                        <span className="font-normal text-muted-foreground">/hr</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {skills.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : null}

              {profile?.bio ? (
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No bio yet.</p>
              )}
            </Reveal>

            <section className="space-y-5">
              <Reveal>
                <h2 className="text-xl font-semibold tracking-tight">Services</h2>
              </Reveal>
              {data.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services listed.</p>
              ) : (
                <RevealGroup as="ul" className="space-y-0">
                  {data.services.map((service) => (
                    <RevealItem
                      key={service.id}
                      as="li"
                      className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 py-5 first:pt-0 last:border-b-0"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium tracking-tight">{service.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                        {service.category?.name ? (
                          <p className="text-xs text-muted-foreground">
                            {service.category.name}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                        {formatCurrency(service.price)}
                      </p>
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
            </section>

            <section className="space-y-5">
              <Reveal>
                <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
              </Reveal>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Completed jobs will show up here.
                </p>
              ) : (
                <RevealGroup as="ul" className="space-y-0">
                  {reviews.map((review) => (
                    <RevealItem
                      key={review.id}
                      as="li"
                      className="space-y-2 border-b border-border/60 py-5 first:pt-0 last:border-b-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {review.customer?.email?.split("@")[0] ?? "Customer"}
                        </p>
                        <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Star aria-hidden="true" className="size-3.5 fill-current" />
                          {review.rating}/5
                        </p>
                      </div>
                      {review.comment ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {review.comment}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {review.booking?.service?.name
                          ? `${review.booking.service.name} · `
                          : ""}
                        {formatDate(review.createdAt)}
                      </p>
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
            </section>
          </div>

          <aside className="hidden lg:block">
            <Reveal className="sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <BookNowPanel technician={data} />
            </Reveal>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 p-4 backdrop-blur-sm lg:hidden">
        <div className="mx-auto max-w-6xl">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Book this technician</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.hourlyRate
                    ? `From ${formatCurrency(profile.hourlyRate)}/hr`
                    : "Choose a service & time"}
                </p>
              </div>
              <Button type="button" size="sm" className="pointer-events-none rounded-full">
                Book now
              </Button>
            </summary>
            <div className="max-h-[70vh] overflow-y-auto pt-4">
              <BookNowPanel technician={data} />
            </div>
          </details>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function TechnicianProfileSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-6 lg:py-14">
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-[1.5rem] sm:h-48" />
        <div className="flex gap-4">
          <Skeleton className="size-24 rounded-full" />
          <div className="space-y-2 pt-10">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="hidden h-80 w-full rounded-3xl lg:block" />
    </div>
  );
}
