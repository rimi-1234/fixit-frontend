"use client";

import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Receipt,
  Wallet,
} from "lucide-react";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPayments } from "@/hooks/use-payments";
import type { PaymentProvider } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";

function providerLabel(provider?: PaymentProvider | string | null) {
  if (!provider) return "Checkout";
  if (provider === "STRIPE") return "Stripe";
  if (provider === "SSLCOMMERZ") return "SSLCommerz";
  return String(provider);
}

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useMyPayments();
  const list = data ?? [];

  const completed = list.filter((p) => p.status === "COMPLETED");
  const pending = list.filter((p) => p.status === "PENDING");
  const spent = completed.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-gradient-to-br from-accent/45 via-card to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -top-16 right-0 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              Checkout activity
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Payments
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Track completed and pending checkouts in ৳ — open any payment to
              jump back to its booking.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full bg-background/70"
            nativeButton={false}
            render={<Link href="/dashboard/customer/bookings" />}
          >
            View bookings
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <RevealItem>
              <StatTile
                label="Total spent"
                value={formatCurrency(spent)}
                hint="Completed payments"
                icon={Wallet}
                iconClassName="bg-success/15 text-success"
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Completed"
                value={completed.length}
                hint="Successful checkouts"
                icon={Receipt}
                iconClassName="bg-primary/10 text-primary"
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Pending"
                value={pending.length}
                hint="Awaiting confirmation"
                icon={CreditCard}
                iconClassName="bg-warning/15 text-warning"
              />
            </RevealItem>
          </>
        )}
      </RevealGroup>

      <Reveal className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Payment history
            </h3>
            <p className="text-sm text-muted-foreground">
              Newest activity first.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/dashboard/customer/bookings" />}
              >
                View bookings
              </Button>
            }
          />
        ) : (
          <RevealGroup
            as="ul"
            animate="visible"
            className="grid gap-3"
          >
            {list.map((payment) => (
              <RevealItem
                key={payment.id}
                as="li"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className={cn(
                  "group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/25 hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                )}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <CreditCard aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold tracking-tight">
                        {formatCurrency(payment.amount)}
                      </p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {providerLabel(payment.provider)}
                      {" · "}
                      {payment.paidAt
                        ? formatDateTime(payment.paidAt)
                        : formatDateTime(payment.createdAt)}
                    </p>
                    {payment.transactionId ? (
                      <p className="truncate font-mono text-[11px] text-muted-foreground/80">
                        {payment.transactionId}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/dashboard/customer/bookings/${payment.bookingId}`}
                    />
                  }
                >
                  View booking
                  <ArrowRight aria-hidden="true" />
                </Button>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Reveal>
    </div>
  );
}
