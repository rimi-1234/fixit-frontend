"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  Users,
  Wrench,
} from "lucide-react";

import {
  ChartCard,
  StatusPieChart,
  TrendLineChart,
  WeeklyBarChart,
  last7DaysCounts,
  last7DaysSums,
  statusBreakdown,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-charts";
import {
  BOOKING_STATUS_FILTERS,
  FilterBar,
  FilterSearch,
  FilterSelect,
  filterBookings,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings, useAdminUsers } from "@/hooks/use-admin";
import { usePagination } from "@/hooks/use-pagination";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

export function AdminAnalyticsPage() {
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError,
    refetch,
  } = useAdminBookings();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const isLoading = usersLoading || bookingsLoading;
  const bookingList = bookings ?? [];
  const userList = users ?? [];

  const stats = useMemo(() => {
    const revenue = bookingList
      .filter((b) => b.payment?.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);
    return {
      users: userList.length,
      bookings: bookingList.length,
      completed: bookingList.filter((b) => b.status === "COMPLETED").length,
      revenue,
      weekData: last7DaysCounts(bookingList),
      revenueTrend: last7DaysSums(
        bookingList.map((b) => ({
          createdAt: b.createdAt,
          paidAt: b.payment?.paidAt,
          amount: b.payment?.amount,
          status: b.payment?.status,
        }))
      ),
      statusData: statusBreakdown(bookingList),
    };
  }, [bookingList, userList]);

  const filtered = useMemo(
    () =>
      filterBookings(bookingList, { search, status }).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [bookingList, search, status]
  );
  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Live platform metrics from users, bookings, and payments.
        </p>
      </div>

      {isError && !bookings ? (
        <EmptyState
          title="Couldn't load analytics"
          description="Check that you're signed in as admin and the API is running."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))
            ) : (
              <>
                <StatTile label="Users" value={stats.users} icon={Users} />
                <StatTile
                  label="Bookings"
                  value={stats.bookings}
                  icon={CalendarDays}
                />
                <StatTile
                  label="Completed"
                  value={stats.completed}
                  icon={Wrench}
                />
                <StatTile
                  label="Revenue"
                  value={formatCurrency(stats.revenue)}
                  icon={Banknote}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard title="Bookings — last 7 days">
              {isLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <WeeklyBarChart data={stats.weekData} label="Bookings" />
              )}
            </ChartCard>
            <ChartCard title="Revenue — last 7 days">
              {isLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <TrendLineChart data={stats.revenueTrend} label="Revenue" />
              )}
            </ChartCard>
            <ChartCard title="Booking status">
              {isLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <StatusPieChart data={stats.statusData} />
              )}
            </ChartCard>
          </div>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Booking activity
              </h2>
              <p className="text-sm text-muted-foreground">
                Filter and page through live booking records.
              </p>
            </div>

            <FilterBar>
              <FilterSearch
                id="analytics-search"
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Service, customer, technician…"
              />
              <FilterSelect
                id="analytics-status"
                label="Status"
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={BOOKING_STATUS_FILTERS}
              />
            </FilterBar>

            {isLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No matching bookings"
                description="Try another search or status filter."
              />
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.service?.name ?? "Service"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.customer?.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.technician?.email ?? "—"}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(booking.scheduledTime)}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {typeof booking.service?.price === "number"
                            ? formatCurrency(booking.service.price)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 pb-4">
                  <PaginationBar
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
