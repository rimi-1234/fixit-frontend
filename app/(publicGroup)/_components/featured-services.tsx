"use client";

import Link from "next/link";

import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/app/(publicGroup)/_components/service-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  RevealGroup,
  RevealItem,
  SectionHeader,
} from "@/components/motion/reveal";
import { useServices } from "@/hooks/use-services";

export function FeaturedServices() {
  const { data, isLoading, isError, refetch } = useServices();
  const featured = (data ?? []).slice(0, 6);

  return (
    <section
      id="services"
      className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <SectionHeader
        title="Featured services"
        description="Popular home services from technicians near you, ready to book."
        action={
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            View all
          </Button>
        }
      />

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
        <RevealGroup
          as="ul"
          animate="visible"
          className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featured.map((service) => (
            <RevealItem
              key={service.id}
              as="li"
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
