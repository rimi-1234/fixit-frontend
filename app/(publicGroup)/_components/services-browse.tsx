"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";

import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/app/(publicGroup)/_components/service-card";
import {
  ServiceFiltersBar,
  applyServiceFilters,
  emptyFilterDraft,
  useDebouncedFilters,
  type ServiceFilterDraft,
} from "@/app/(publicGroup)/_components/service-filters";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useServices } from "@/hooks/use-services";

export function ServicesBrowse() {
  const [draft, setDraft] = useState<ServiceFilterDraft>(() => emptyFilterDraft());
  const filters = useDebouncedFilters(draft);

  const { data, isLoading, isError, isFetching, refetch } = useServices(filters);
  const services = useMemo(
    () => applyServiceFilters(data ?? [], filters),
    [data, filters]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Filter by category, location, price, and rating to find the right technician.
          </p>
        </div>
      </div>

      <ServiceFiltersBar
        value={draft}
        onChange={setDraft}
        onClear={() => setDraft(emptyFilterDraft())}
        resultCount={isLoading ? undefined : services.length}
        isFetching={isFetching && !isLoading}
      />

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Wrench}
            title="Couldn't load services"
            description="Check that the FixItNow API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services match your filters"
            description="Try clearing filters or broadening your search."
            action={
              <Button
                variant="outline"
                onClick={() => setDraft(emptyFilterDraft())}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <RevealGroup
            as="ul"
            animate="visible"
            className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => (
              <RevealItem
                key={service.id}
                as="li"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <ServiceCard service={service} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
