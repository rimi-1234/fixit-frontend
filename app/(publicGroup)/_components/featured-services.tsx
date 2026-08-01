"use client";

import Link from "next/link";

import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/app/(publicGroup)/_components/service-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useServices } from "@/hooks/use-services";

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
            <ServiceCardSkeleton key={i} />
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
          {featured.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ul>
      )}
    </section>
  );
}
