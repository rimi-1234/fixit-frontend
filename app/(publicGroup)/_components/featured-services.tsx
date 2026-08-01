"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useServices } from "@/hooks/use-services";
import { formatCurrency } from "@/utils/format-currency";
import { colorFromString, getInitials } from "@/utils/get-initials";

export function FeaturedServices() {
  const { data, isLoading, isError, refetch } = useServices();
  const featured = (data ?? []).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured services
          </h2>
          <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
            Popular home services from technicians near you, ready to book.
          </p>
        </div>
        <Button variant="ghost" nativeButton={false} render={<Link href="/services" />}>
          View all
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load services"
          description="Check that the API is running, then try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : featured.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Technicians will publish services here soon."
          action={
            <Button nativeButton={false} render={<Link href="/register" />}>
              Join as a technician
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => {
            const techEmail = service.technician?.email ?? "Technician";
            const rating = service.technician?.averageRating ?? 0;
            return (
              <li key={service.id} className="group">
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
          })}
        </ul>
      )}
    </section>
  );
}
