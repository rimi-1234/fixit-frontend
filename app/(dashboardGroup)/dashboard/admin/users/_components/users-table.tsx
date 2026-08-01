"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import type { Role, User, UserStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

type RoleFilter = "ALL" | Role;
type StatusFilter = "ALL" | UserStatus;

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function roleLabel(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function StatusPill({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        status === "ACTIVE"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400"
      )}
    >
      {status === "ACTIVE" ? "Active" : "Banned"}
    </span>
  );
}

export function AdminUsersTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role: role === "ALL" ? undefined : role,
      status: status === "ALL" ? undefined : status,
    }),
    [debouncedSearch, role, status]
  );

  const { data, isLoading, isError, isFetching, refetch } = useAdminUsers(filters);
  const updateStatus = useUpdateUserStatus();
  const users = data ?? [];

  async function toggleStatus(user: User) {
    const next: UserStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";

    if (user.role === "ADMIN" && next === "BANNED") {
      if (!confirm("Ban an admin account? They will lose access immediately.")) {
        return;
      }
    } else if (next === "BANNED") {
      if (!confirm(`Ban ${user.email}?`)) return;
    }

    setPendingId(user.id);
    try {
      await updateStatus.mutateAsync({ userId: user.id, status: next });
    } catch {
      // toast in mutation
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, filter by role or status, and ban or unban accounts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/admin" />}
        >
          Overview
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="user-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="user-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="user-role">Role</Label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleFilter)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="ALL">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="user-status">Status</Label>
          <select
            id="user-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load users"
          description="Check that you're signed in as admin and the API is running."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match"
          description="Try clearing search or changing role/status filters."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {users.length} user{users.length === 1 ? "" : "s"}
            {isFetching ? " · refreshing…" : ""}
          </p>

          {/* Mobile */}
          <ul className="divide-y divide-border/60 md:hidden">
            {users.map((user) => {
              const busy = pendingId === user.id;
              return (
                <li key={user.id} className="space-y-3 py-4">
                  <div className="space-y-1">
                    <p className="font-medium tracking-tight">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{roleLabel(user.role)}</span>
                      <StatusPill status={user.status} />
                    </div>
                    {user.role === "TECHNICIAN" && user.technicianProfile ? (
                      <p className="text-sm text-muted-foreground">
                        {user.technicianProfile.location || "No location"}
                        {user.technicianProfile.skills?.length
                          ? ` · ${user.technicianProfile.skills.slice(0, 3).join(", ")}`
                          : ""}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={user.status === "ACTIVE" ? "destructive" : "outline"}
                    disabled={busy}
                    onClick={() => toggleStatus(user)}
                  >
                    {busy ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : null}
                    {user.status === "ACTIVE" ? "Ban" : "Unban"}
                  </Button>
                </li>
              );
            })}
          </ul>

          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const busy = pendingId === user.id;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{roleLabel(user.role)}</TableCell>
                      <TableCell>
                        <StatusPill status={user.status} />
                      </TableCell>
                      <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                        {user.role === "TECHNICIAN" && user.technicianProfile
                          ? [
                              user.technicianProfile.location,
                              user.technicianProfile.skills?.slice(0, 2).join(", "),
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"
                          : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={
                            user.status === "ACTIVE" ? "destructive" : "outline"
                          }
                          disabled={busy}
                          onClick={() => toggleStatus(user)}
                        >
                          {busy ? (
                            <Loader2
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : null}
                          {user.status === "ACTIVE" ? "Ban" : "Unban"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
