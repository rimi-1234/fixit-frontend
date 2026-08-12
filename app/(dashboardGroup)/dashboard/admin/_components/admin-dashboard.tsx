"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  FolderTree,
  ShieldAlert,
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
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
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
import type { BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

const ACTIVE_BOOKINGS: BookingStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "PAID",
  "IN_PROGRESS",
];

export function AdminDashboard() {
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useAdminUsers();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useAdminBookings();

  const isLoading = usersLoading || bookingsLoading;
  const isError = usersError || bookingsError;

  const stats = useMemo(() => {
    const userList = users ?? [];
    const bookingList = bookings ?? [];

    const customers = userList.filter((u) => u.role === "CUSTOMER").length;
    const technicians = userList.filter((u) => u.role === "TECHNICIAN").length;
    const banned = userList.filter((u) => u.status === "BANNED").length;
    const activeBookings = bookingList.filter((b) =>
      ACTIVE_BOOKINGS.includes(b.status)
    ).length;
    const completed = bookingList.filter((b) => b.status === "COMPLETED").length;
    const revenue = bookingList
      .filter((b) => b.payment?.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

    const recent = bookingList
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return {
      totalUsers: userList.length,
      customers,
      technicians,
      banned,
      totalBookings: bookingList.length,
      activeBookings,
      completed,
      revenue,
      recent,
      statusData: statusBreakdown(bookingList),
      weekData: last7DaysCounts(bookingList),
      revenueTrend: last7DaysSums(
        bookingList.map((b) => ({
          createdAt: b.createdAt,
          paidAt: b.payment?.paidAt,
          amount: b.payment?.amount,
          status: b.payment?.status,
        }))
      ),
    };
  }, [users, bookings]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filteredRecent = useMemo(
    () => filterBookings(stats.recent, { search, status }),
    [stats.recent, search, status]
  );
  const { page, setPage, totalPages, paged } = usePagination(filteredRecent, 8);

  function retry() {
    void refetchUsers();
    void refetchBookings();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Admin dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Live totals, charts, and bookings from the platform API.
        </p>
      </div>

      {isError && !users && !bookings ? (
        <EmptyState
          title="Couldn't load admin data"
          description="Check that you're signed in as admin and the API is running."
          action={
            <Button variant="outline" onClick={retry}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <RevealGroup as="div" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))
            ) : (
              <>
                <RevealItem as="div">
                  <StatTile
                    label="Total users"
                    value={stats.totalUsers}
                    icon={Users}
                  />
                </RevealItem>
                <RevealItem as="div">
                  <StatTile
                    label="Active bookings"
                    value={stats.activeBookings}
                    icon={CalendarDays}
                  />
                </RevealItem>
                <RevealItem as="div">
                  <StatTile
                    label="Completed jobs"
                    value={stats.completed}
                    icon={Wrench}
                  />
                </RevealItem>
                <RevealItem as="div">
                  <StatTile
                    label="Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={Banknote}
                  />
                </RevealItem>
              </>
            )}
          </RevealGroup>

          <RevealGroup as="div" className="grid gap-3 sm:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))
            ) : (
              <>
                <RevealItem as="div">
                  <StatTile label="Customers" value={stats.customers} />
                </RevealItem>
                <RevealItem as="div">
                  <StatTile label="Technicians" value={stats.technicians} />
                </RevealItem>
                <RevealItem as="div">
                  <StatTile
                    label="Banned users"
                    value={stats.banned}
                    icon={ShieldAlert}
                  />
                </RevealItem>
              </>
            )}
          </RevealGroup>

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

          <section className="space-y-3 border-y border-border/60 py-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Quick links
              </h2>
              <p className="text-sm text-muted-foreground">
                Jump into moderation and catalog tools.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/admin/users" />}
              >
                <Users aria-hidden="true" />
                Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/admin/bookings" />}
              >
                <CalendarDays aria-hidden="true" />
                Bookings
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/admin/categories" />}
              >
                <FolderTree aria-hidden="true" />
                Categories
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Recent bookings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest activity across the platform ({stats.totalBookings}{" "}
                  total).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/admin/bookings" />}
              >
                View all
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : stats.recent.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No bookings yet"
                description="When customers book technicians, they'll appear here."
              />
            ) : (
              <>
                <FilterBar>
                  <FilterSearch
                    id="admin-overview-search"
                    value={search}
                    onChange={(value) => {
                      setSearch(value);
                      setPage(1);
                    }}
                    placeholder="Service, customer, technician…"
                  />
                  <FilterSelect
                    id="admin-overview-status"
                    label="Status"
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                    options={BOOKING_STATUS_FILTERS}
                  />
                </FilterBar>
                {filteredRecent.length === 0 ? (
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
                        <TableCell>{formatDateTime(booking.scheduledTime)}</TableCell>
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
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
