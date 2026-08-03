"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPayments } from "@/hooks/use-payments";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useMyPayments();
  const list = data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Reveal className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Payments
        </h2>
        <p className="text-sm text-muted-foreground">
          Completed and pending checkout activity in ৳.
        </p>
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={CreditCard}
            title="Couldn't load payments"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments appear here after a technician accepts and you complete checkout."
            action={
              <Button
                nativeButton={false}
                render={<Link href="/dashboard/customer/bookings" />}
              >
                View bookings
              </Button>
            }
          />
        ) : (
          <RevealGroup as="ul" className="divide-y divide-border/60">
            {list.map((payment) => (
              <RevealItem
                key={payment.id}
                as="li"
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium tracking-tight">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.status.toLowerCase()}
                    {payment.provider ? ` · ${payment.provider}` : ""}
                    {payment.paidAt
                      ? ` · ${formatDateTime(payment.paidAt)}`
                      : ` · ${formatDateTime(payment.createdAt)}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  nativeButton={false}
                  render={
                    <Link href={`/dashboard/customer/bookings/${payment.bookingId}`} />
                  }
                >
                  View booking
                </Button>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Reveal>
    </div>
  );
}
