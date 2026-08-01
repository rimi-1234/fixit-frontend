"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { BookNowPanel } from "@/app/(publicGroup)/_components/book-now-panel";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useTechnician } from "@/hooks/use-technicians";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { colorFromString, getInitials } from "@/utils/get-initials";

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
              <Button nativeButton={false} render={<Link href="/services" />}>
                Browse services
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
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 lg:px-6 lg:py-14">
        <div className="space-y-10 pb-28 lg:pb-0">
          <header className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold sm:size-20 sm:text-xl"
                style={{ background: colorFromString(data.id) }}
              >
                {getInitials(data.email)}
              </div>
              <div className="min-w-0 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight capitalize">
                  {displayName}
                </h1>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star aria-hidden="true" className="size-3.5 fill-current" />
                    {data.averageRating > 0
                      ? `${data.averageRating.toFixed(1)} · ${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"}`
                      : "New on FixItNow"}
                  </span>
                  {profile?.location ? <span>{profile.location}</span> : null}
                  {typeof profile?.experience === "number" ? (
                    <span>{profile.experience} yrs experience</span>
                  ) : null}
                  {profile?.hourlyRate ? (
                    <span>From {formatCurrency(profile.hourlyRate)}/hr</span>
                  ) : null}
                </p>
              </div>
            </div>

            {skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
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
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Services</h2>
            {data.services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services listed.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {data.services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-4 first:pt-0"
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
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Completed jobs will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {reviews.map((review) => (
                  <li key={review.id} className="space-y-2 py-5 first:pt-0">
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
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 border-t border-border/60 pt-6">
            <BookNowPanel technician={data} />
          </div>
        </aside>
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
              <Button type="button" size="sm" className="pointer-events-none">
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
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-6 lg:py-14">
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full sm:size-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="hidden h-80 w-full lg:block" />
    </div>
  );
}
