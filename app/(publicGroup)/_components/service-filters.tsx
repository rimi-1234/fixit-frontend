"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCategories } from "@/hooks/use-categories";
import type { ServiceFilters } from "@/service/service.service";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
  { label: "Any", value: "" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "4.5+", value: "4.5" },
];

export type ServiceFilterDraft = {
  search: string;
  type: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
};

export function emptyFilterDraft(): ServiceFilterDraft {
  return {
    search: "",
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  };
}

export function draftToFilters(draft: ServiceFilterDraft): ServiceFilters {
  return {
    search: draft.search.trim() || undefined,
    type: draft.type || undefined,
    location: draft.location.trim() || undefined,
    minPrice: draft.minPrice ? Number(draft.minPrice) : undefined,
    maxPrice: draft.maxPrice ? Number(draft.maxPrice) : undefined,
    minRating: draft.minRating ? Number(draft.minRating) : undefined,
  };
}

function FilterFields({
  draft,
  onChange,
  idPrefix,
}: {
  draft: ServiceFilterDraft;
  onChange: (next: ServiceFilterDraft) => void;
  idPrefix: string;
}) {
  const { data: categories } = useCategories();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-2 xl:col-span-2">
        <Label htmlFor={`${idPrefix}-search`}>Search</Label>
        <Input
          id={`${idPrefix}-search`}
          value={draft.search}
          onChange={(e) => onChange({ ...draft, search: e.target.value })}
          placeholder="Service name or description"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-type`}>Category</Label>
        <select
          id={`${idPrefix}-type`}
          value={draft.type}
          onChange={(e) => onChange({ ...draft, type: e.target.value })}
          className={cn(
            "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          <option value="">All categories</option>
          {(categories ?? []).map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-location`}>Location</Label>
        <Input
          id={`${idPrefix}-location`}
          value={draft.location}
          onChange={(e) => onChange({ ...draft, location: e.target.value })}
          placeholder="Dhaka"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-minPrice`}>Min price</Label>
        <Input
          id={`${idPrefix}-minPrice`}
          type="number"
          min={0}
          inputMode="decimal"
          value={draft.minPrice}
          onChange={(e) => onChange({ ...draft, minPrice: e.target.value })}
          placeholder="0"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-maxPrice`}>Max price</Label>
        <Input
          id={`${idPrefix}-maxPrice`}
          type="number"
          min={0}
          inputMode="decimal"
          value={draft.maxPrice}
          onChange={(e) => onChange({ ...draft, maxPrice: e.target.value })}
          placeholder="Any"
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
        <Label htmlFor={`${idPrefix}-rating`}>Min rating</Label>
        <select
          id={`${idPrefix}-rating`}
          value={draft.minRating}
          onChange={(e) => onChange({ ...draft, minRating: e.target.value })}
          className={cn(
            "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          {RATING_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ServiceFiltersBar({
  value,
  onChange,
  onClear,
  resultCount,
  isFetching,
}: {
  value: ServiceFilterDraft;
  onChange: (next: ServiceFilterDraft) => void;
  onClear: () => void;
  resultCount?: number;
  isFetching?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasActiveFilters = Object.values(value).some((v) => v !== "");

  return (
    <div className="sticky top-16 z-30 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {typeof resultCount === "number"
                ? `${resultCount} service${resultCount === 1 ? "" : "s"}`
                : "Browse services"}
              {isFetching ? " · updating…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                <X aria-hidden="true" />
                Clear
              </Button>
            ) : null}

            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 p-4">
                    <FilterFields
                      draft={value}
                      onChange={onChange}
                      idPrefix="mobile"
                    />
                    <Button className="w-full" onClick={() => setOpen(false)}>
                      Show results
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <FilterFields draft={value} onChange={onChange} idPrefix="desktop" />
        </div>
      </div>
    </div>
  );
}

/** Debounce draft filters before hitting the API. */
export function useDebouncedFilters(
  draft: ServiceFilterDraft,
  delayMs = 350
): ServiceFilters {
  const [filters, setFilters] = useState(() => draftToFilters(draft));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(draftToFilters(draft));
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [draft, delayMs]);

  return filters;
}
