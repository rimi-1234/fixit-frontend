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
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { useTechnician } from "@/hooks/use-technicians";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { technicianImageUrl } from "@/utils/technician-images";

const PROFILE_HERO =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80";

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
  const displayName = displayNameFromEmail(data.email);
  const skills = profile?.skills ?? [];
  const reviews = data.reviews ?? [];
  const avatar = technicianImageUrl(data);

  return (
    <div className="flex flex-1 flex-col">
      {/* Full-bleed work context — not a cropped face banner */}
      <section className="relative isolate h-52 w-full overflow-hidden sm:h-64 md:h-72 lg:h-80">
        <Image
          src={PROFILE_HERO}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-start px-4 pt-6 sm:px-6">
          <Link
            href="/technicians"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to professionals
          </Link>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-28 sm:px-6 lg:pb-16">
        <div className="-mt-16 grid gap-10 sm:-mt-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="min-w-0 space-y-12">
            <Reveal className="space-y-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7">
                <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-full ring-4 ring-background sm:mx-0 sm:size-32">
                  <Image
                    src={avatar}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                    priority
                    unoptimized={shouldUnoptimizeImage(avatar)}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-3 text-center sm:pb-1 sm:text-left">
                  <div className="space-y-2">
                    <h1 className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-3xl font-semibold tracking-tight sm:justify-start sm:text-4xl">
                      <span>{displayName}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary normal-case">
                        <BadgeCheck aria-hidden="true" className="size-4" />
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
                          {profile.experience} yrs experience
                        </span>
                      ) : null}
                    </p>
                  </div>

                  {profile?.hourlyRate ? (
                    <p className="text-base font-semibold tracking-tight">
                      From {formatCurrency(profile.hourlyRate)}
                      <span className="font-normal text-muted-foreground">/hr</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {skills.length > 0 ? (
                <p className="text-center text-sm text-muted-foreground sm:text-left">
                  {skills.join(" · ")}
                </p>
              ) : null}

              {profile?.bio ? (
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : null}
            </Reveal>

            <section className="space-y-5">
              <Reveal>
                <h2 className="text-xl font-semibold tracking-tight">Services</h2>
              </Reveal>
              {data.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services listed.</p>
              ) : (
                <RevealGroup as="ul" animate="visible" className="space-y-0">
                  {data.services.map((service) => (
                    <RevealItem
                      key={service.id}
                      as="li"
                      className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/50 py-5 first:pt-0 last:border-b-0"
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
                      <p className="shrink-0 text-sm font-semibold">
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
                <RevealGroup as="ul" animate="visible" className="space-y-0">
                  {reviews.map((review) => (
                    <RevealItem
                      key={review.id}
                      as="li"
                      className="space-y-2 border-b border-border/50 py-5 first:pt-0 last:border-b-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {displayNameFromEmail(review.customer?.email)}
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
            <Reveal className="sticky top-24 space-y-3 border-l border-border/60 pl-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Book
              </p>
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
                <p className="text-sm font-medium">Book {displayName}</p>
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
    <div className="flex flex-1 flex-col">
      <Skeleton className="h-52 w-full rounded-none sm:h-64" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-6">
        <div className="-mt-16 space-y-6">
          <div className="flex gap-5">
            <Skeleton className="size-28 rounded-full ring-4 ring-background" />
            <div className="space-y-2 pt-14">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-20 w-full max-w-2xl" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="mt-10 hidden h-80 w-full lg:block" />
      </div>
    </div>
  );
}
