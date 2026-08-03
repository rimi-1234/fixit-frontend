"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/utils/get-initials";

export function CustomerProfilePage() {
  const { user, role, logout } = useAuth();
  const initials = getInitials(user?.email ?? "U", 1);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Your customer workspace account details.
        </p>
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-lg font-semibold tracking-tight">
              {user?.email ?? "Signed in"}
            </p>
            <p className="text-sm capitalize text-muted-foreground">
              {role?.toLowerCase() ?? "customer"} workspace
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-border/60 pt-6">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="text-sm font-medium">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="text-sm font-medium capitalize">
              {role?.toLowerCase() ?? "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Browse services
          </Button>
          <Button variant="outline" className="rounded-full" onClick={logout}>
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
