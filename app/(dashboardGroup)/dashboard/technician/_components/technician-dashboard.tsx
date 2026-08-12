"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarClock,
  ClipboardList,
  Clock3,
  Inbox,
  Settings2,
  Star,
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
import { useAuth } from "@/hooks/use-auth";
import { usePagination } from "@/hooks/use-pagination";
import { useTechnician, useTechnicianBookings } from "@/hooks/use-technicians";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

const ACTIVE_STATUSES = new Set(["ACCEPTED", "PAID", "IN_PROGRESS"]);

function sortBySchedule(a: Booking, b: Booking) {
  return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
}

export function TechnicianDashboard() {
  const { user } = useAuth();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch,
  } = useTechnicianBookings();
  const { data: profile, isLoading: profileLoading } = useTechnician(user?.id);

  const list = bookings ?? [];
  const pending = list.filter((b) => b.status === "REQUESTED");
  const upcoming = list
    .filter((b) => ACTIVE_STATUSES.has(b.status))
    .slice()
    .sort(sortBySchedule);
  const inProgress = list.filter((b) => b.status === "IN_PROGRESS").length;
  const completed = list.filter((b) => b.status === "COMPLETED");
  const earnings = list
    .filter((b) => b.payment?.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

  const weekData = last7DaysCounts(list);
  const earningsTrend = last7DaysSums(
    list.map((b) => ({
      createdAt: b.createdAt,
      paidAt: b.payment?.paidAt,
      amount: b.payment?.amount,
      status: b.payment?.status,
    }))
  );
  const statusData = statusBreakdown(list);

  const jobs = useMemo(
    () =>
      list
        .slice()
        .sort(
          (a, b) =>
            new Date(b.scheduledTime).getTime() -
            new Date(a.scheduledTime).getTime()
        ),
    [list]
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filteredJobs = useMemo(
    () => filterBookings(jobs, { search, status }),
    [jobs, search, status]
  );
  const { page, setPage, totalPages, paged } = usePagination(filteredJobs, 8);

  const techProfile = profile?.technicianProfile;
  const serviceCount = profile?.services?.length ?? 0;
  const needsProfile = !techProfile?.skills?.length || !techProfile.location;
  const needsAvailability = !(techProfile?.availability?.length);
  const needsServices = serviceCount === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Technician dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Incoming requests, upcoming jobs, and earnings at a glance.
        </p>
      </div>

      <RevealGroup as="div" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {bookingsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))
        ) : (
          <>
            <RevealItem as="div">
              <StatTile label="Pending requests" value={pending.length} icon={Inbox} />
            </RevealItem>
            <RevealItem as="div">
              <StatTile label="Upcoming jobs" value={upcoming.length} icon={CalendarClock} />
            </RevealItem>
            <RevealItem as="div">
              <StatTile label="In progress" value={inProgress} icon={Clock3} />
            </RevealItem>
            <RevealItem as="div">
              <StatTile
                label="Earnings"
                value={formatCurrency(earnings)}
                icon={Banknote}
              />
            </RevealItem>
          </>
        )}
      </RevealGroup>

      <RevealGroup as="div" className="grid gap-3 sm:grid-cols-2">
        {bookingsLoading || profileLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))
        ) : (
          <>
            <RevealItem as="div">
              <StatTile
                label="Completed jobs"
                value={completed.length}
                icon={ClipboardList}
              />
            </RevealItem>
            <RevealItem as="div">
              <StatTile
                label="Average rating"
                value={
                  profile?.averageRating
                    ? profile.averageRating.toFixed(1)
                    : "—"
                }
                hint={
                  profile?.reviewCount
                    ? `${profile.reviewCount} review${profile.reviewCount === 1 ? "" : "s"}`
                    : "No reviews yet"
                }
                icon={Star}
              />
            </RevealItem>
          </>
        )}
      </RevealGroup>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Jobs — last 7 days">
          {bookingsLoading ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : (
            <WeeklyBarChart data={weekData} label="Jobs" />
          )}
        </ChartCard>
        <ChartCard title="Earnings — last 7 days">
          {bookingsLoading ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : (
            <TrendLineChart data={earningsTrend} label="Earnings" />
          )}
        </ChartCard>
        <ChartCard title="Job status">
          {bookingsLoading ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : (
            <StatusPieChart data={statusData} />
          )}
        </ChartCard>
      </div>

      {(needsProfile || needsAvailability || needsServices) && !profileLoading ? (
        <section className="space-y-3 border-y border-border/60 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Finish setup</h2>
            <p className="text-sm text-muted-foreground">
              Complete these so customers can find and book you.
            </p>
          </div>
          <ul className="space-y-2">
            {needsProfile ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Add skills, rate, and location</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/profile" />}
                >
                  <Settings2 aria-hidden="true" />
                  Profile
                </Button>
              </li>
            ) : null}
            {needsAvailability ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Publish weekly availability slots</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/availability" />}
                >
                  <CalendarClock aria-hidden="true" />
                  Availability
                </Button>
              </li>
            ) : null}
            {needsServices ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">List at least one service</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/services" />}
                >
                  <Wrench aria-hidden="true" />
                  Services
                </Button>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">All jobs</h2>
            <p className="text-sm text-muted-foreground">
              Requests, upcoming work, and completed jobs from your bookings API.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/technician/bookings" />}
          >
            Manage bookings
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : bookingsError ? (
          <EmptyState
            title="Couldn't load bookings"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No jobs yet"
            description="New booking requests will show up here."
          />
        ) : (
          <>
            <FilterBar>
              <FilterSearch
                id="tech-overview-search"
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Service or customer…"
              />
              <FilterSelect
                id="tech-overview-status"
                label="Status"
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={BOOKING_STATUS_FILTERS}
              />
            </FilterBar>
            {filteredJobs.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No matching jobs"
                description="Try another search or status filter."
              />
            ) : (
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
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
    </div>
  );
}
