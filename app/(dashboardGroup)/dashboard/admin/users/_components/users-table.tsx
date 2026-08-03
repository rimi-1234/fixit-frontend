"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
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
          ? "bg-success/15 text-success"
          : "bg-destructive/10 text-destructive"
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
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [banning, setBanning] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function toggleStatus(user: User) {
    const next: UserStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";

    if (next === "BANNED") {
      setBanTarget(user);
      return;
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

  async function confirmBan() {
    if (!banTarget) return;
    setBanning(true);
    setPendingId(banTarget.id);
    try {
      await updateStatus.mutateAsync({ userId: banTarget.id, status: "BANNED" });
      setBanTarget(null);
    } catch {
      // toast in mutation
    } finally {
      setBanning(false);
      setPendingId(null);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(banTarget)}
        onOpenChange={(open) => {
          if (!open && !banning) setBanTarget(null);
        }}
        title={
          banTarget?.role === "ADMIN"
            ? "Ban an admin account?"
            : `Ban ${banTarget?.email ?? "this user"}?`
        }
        description={
          banTarget?.role === "ADMIN"
            ? "They will lose access immediately. Only do this if you intend to lock them out."
            : "They won’t be able to sign in until an admin reactivates the account."
        }
        confirmLabel="Ban user"
        tone="danger"
        loading={banning}
        onConfirm={confirmBan}
      />

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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
            onChange={(e) => {
              setRole(e.target.value as RoleFilter);
              setPage(1);
            }}
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
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
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
            {users.length > pageSize
              ? ` · page ${currentPage} of ${totalPages}`
              : ""}
            {isFetching ? " · refreshing…" : ""}
          </p>

          {/* Mobile */}
          <ul className="divide-y divide-border/60 md:hidden">
            {pagedUsers.map((user) => {
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
                {pagedUsers.map((user) => {
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

          {users.length > pageSize ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, users.length)} of {users.length}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
