"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import { apiFetch } from "@/lib/api-client";
import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { usePagination } from "@/hooks/use-pagination";
import { useCategories } from "@/hooks/use-categories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { data: categories } = useCategories();

  const { data: services, isLoading, isError, refetch } = useQuery<Service[]>({
    queryKey: ["admin", "all-services"],
    queryFn: () => apiFetch<Service[]>("/services", { skipAuth: true }),
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (services ?? []).filter((service) => {
      if (categoryId && service.categoryId !== categoryId) return false;
      if (!query) return true;
      return [service.name, service.category?.name, service.technician?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [services, search, categoryId]);
  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">All Services</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} services on the platform
        </p>
      </div>

      <FilterBar>
        <FilterSearch
          id="admin-services-search"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Name, category, technician…"
        />
        <FilterSelect
          id="admin-services-category"
          label="Category"
          value={categoryId}
          onChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All categories" },
            ...(categories ?? []).map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
        />
      </FilterBar>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Wrench}
          title="Couldn't load services"
          description="API error."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services found"
          description="Try a different search or category filter."
        />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.technician?.email ?? service.technicianId}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(service.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
