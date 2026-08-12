"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Booking, Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

export const filterSelectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export const BOOKING_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const PAYMENT_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export function FilterBar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function FilterSearch({
  id,
  label = "Search",
  value,
  onChange,
  placeholder = "Search…",
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>
    </div>
  );
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterSelectClassName}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function filterBookings(
  bookings: Booking[],
  { search, status }: { search: string; status: string }
) {
  const query = search.trim().toLowerCase();
  return bookings.filter((booking) => {
    if (status && booking.status !== status) return false;
    if (!query) return true;
    const haystack = [
      booking.service?.name,
      booking.customer?.email,
      booking.technician?.email,
      booking.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function filterPayments(
  payments: Payment[],
  { search, status }: { search: string; status: string }
) {
  const query = search.trim().toLowerCase();
  return payments.filter((payment) => {
    if (status && payment.status !== status) return false;
    if (!query) return true;
    const haystack = [
      payment.transactionId,
      payment.provider,
      payment.method,
      payment.status,
      String(payment.amount),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
