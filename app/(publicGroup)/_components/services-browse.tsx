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
import { PaginationBar } from "@/components/pagination-bar";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useServices } from "@/hooks/use-services";
import type { Service } from "@/lib/types";

type SortOption = "default" | "price-asc" | "price-desc" | "rating-desc";
const PAGE_SIZE = 9;

function sortServices(services: Service[], sort: SortOption): Service[] {
  if (sort === "price-asc") return [...services].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...services].sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") return [...services].sort((a, b) => (b.technician?.averageRating ?? 0) - (a.technician?.averageRating ?? 0));
  return services;
}

export function ServicesBrowse() {
  const [draft, setDraft] = useState<ServiceFilterDraft>(() => emptyFilterDraft());
  const [sort, setSort] = useState<SortOption>("default");
  const [page, setPage] = useState(1);
  const filters = useDebouncedFilters(draft);

  const { data, isLoading, isError, isFetching, refetch } = useServices(filters);
  const filtered = useMemo(() => applyServiceFilters(data ?? [], filters), [data, filters]);
  const sorted = useMemo(() => sortServices(filtered, sort), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSortChange(newSort: SortOption) {
    setSort(newSort);
    setPage(1);
  }

  function handleFilterChange(newDraft: ServiceFilterDraft) {
    setDraft(newDraft);
    setPage(1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Filter by category, location, price, and rating to find the right technician.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <ServiceFiltersBar
        value={draft}
        onChange={handleFilterChange}
        onClear={() => { setDraft(emptyFilterDraft()); setPage(1); }}
        resultCount={isLoading ? undefined : sorted.length}
        isFetching={isFetching && !isLoading}
      />

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services match your filters"
            description="Try clearing filters or broadening your search."
            action={
              <Button
                variant="outline"
                onClick={() => { setDraft(emptyFilterDraft()); setPage(1); }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <RevealGroup
              as="ul"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {paginated.map((service) => (
                <RevealItem
                  key={service.id}
                  as="li"
                  className="flex"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <ServiceCard service={service} />
                </RevealItem>
              ))}
            </RevealGroup>

            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
