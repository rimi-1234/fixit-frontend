"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Receipt,
  Wallet,
} from "lucide-react";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
  PAYMENT_STATUS_FILTERS,
  filterPayments,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyPayments } from "@/hooks/use-payments";
import { usePagination } from "@/hooks/use-pagination";
import type { PaymentProvider } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

function providerLabel(provider?: PaymentProvider | string | null) {
  if (!provider) return "Checkout";
  if (provider === "STRIPE") return "Stripe";
  if (provider === "SSLCOMMERZ") return "SSLCommerz";
  return String(provider);
}

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useMyPayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const all = data ?? [];
  const list = useMemo(
    () => filterPayments(all, { search, status }),
    [all, search, status]
  );
  const { page, setPage, totalPages, paged } = usePagination(list, 8);

  const completed = all.filter((p) => p.status === "COMPLETED");
  const pending = all.filter((p) => p.status === "PENDING");
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
        <div className="mb-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              Payment history
            </h3>
            <p className="text-sm text-muted-foreground">
              Filter by status or search transaction details.
            </p>
          </div>
          <FilterBar>
            <FilterSearch
              id="payments-search"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Transaction, provider, amount…"
            />
            <FilterSelect
              id="payments-status"
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={PAYMENT_STATUS_FILTERS}
            />
          </FilterBar>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
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
        ) : all.length === 0 ? (
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
        ) : list.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No matching payments"
            description="Try another search or status filter."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{providerLabel(payment.provider)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(payment.paidAt || payment.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate font-mono text-xs text-muted-foreground">
                      {payment.transactionId || "—"}
                    </TableCell>
                    <TableCell className="text-right">
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
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Reveal>
    </div>
  );
}
