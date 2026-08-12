"use client";

import Link from "next/link";
import { LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { AccountProfileForm } from "@/app/(dashboardGroup)/dashboard/_components/account-profile-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { profilePathForRole } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function DashboardSettingsPage() {
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const profileHref = role ? profilePathForRole(role) : "/login";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Appearance, account details, and session controls.
        </p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Choose how FixItNow looks on this device.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const active = mounted && theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <option.icon className="size-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <AccountProfileForm title="Account information" />
      </section>

      <section className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          nativeButton={false}
          render={<Link href={profileHref} />}
        >
          <UserRound aria-hidden="true" />
          Open profile
        </Button>
        <Button variant="ghost" className="rounded-full ml-auto" onClick={logout}>
          <LogOut aria-hidden="true" />
          Log out
        </Button>
        {user?.email ? (
          <p className="w-full text-xs text-muted-foreground">{user.email}</p>
        ) : null}
      </section>
    </div>
  );
}
