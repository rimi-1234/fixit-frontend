"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 10;

export default function AdminServicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: services, isLoading, isError, refetch } = useQuery<Service[]>({
    queryKey: ["admin", "all-services"],
    queryFn: () => apiFetch<Service[]>("/services", { skipAuth: true }),
  });

  const filtered = (services ?? []).filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">All Services</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} services on the platform</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring/50 w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState icon={Wrench} title="Couldn't load services" description="API error." action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>} />
      ) : paginated.length === 0 ? (
        <EmptyState icon={Wrench} title="No services found" description="Try a different search term." />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Technician</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginated.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.technician?.email ?? s.technicianId}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
