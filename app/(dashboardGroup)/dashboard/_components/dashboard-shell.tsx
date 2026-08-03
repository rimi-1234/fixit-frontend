"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings2,
  Star,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/get-initials";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/customer/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/customer/profile", label: "Profile", icon: UserRound },
  ],
  TECHNICIAN: [
    { href: "/dashboard/technician", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/technician/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/technician/services", label: "Services", icon: Wrench },
    { href: "/dashboard/technician/availability", label: "Availability", icon: CalendarDays },
    { href: "/dashboard/technician/profile", label: "Profile", icon: Settings2 },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/admin/categories", label: "Categories", icon: FolderTree },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer",
  TECHNICIAN: "Technician",
  ADMIN: "Admin",
};

function isNavActive(pathname: string, href: string) {
  const isExactOverview =
    href.endsWith("/customer") ||
    href.endsWith("/technician") ||
    href.endsWith("/admin");

  return isExactOverview
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string, items: NavItem[]) {
  const match = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isNavActive(pathname, item.href));
  return match?.label ?? "Overview";
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = isNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent pl-4 text-accent-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-2 size-1.5 -translate-y-1/2 rounded-full bg-primary"
              />
            ) : null}
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const items = role ? NAV_BY_ROLE[role] : [];
  const initials = getInitials(user?.email ?? "U", 1);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-card/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench aria-hidden="true" className="size-4" />
          </span>
          FixItNow
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-3 py-2">
        <p className="px-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Workspace
        </p>
        <NavLinks items={items} pathname={pathname} />
      </div>

      <div className="space-y-3 border-t border-border/50 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.email ?? "Signed in"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {role ? `${ROLE_LABEL[role]} workspace` : "Workspace"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start rounded-xl"
          onClick={logout}
        >
          <LogOut aria-hidden="true" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const items = role ? NAV_BY_ROLE[role] : [];
  const title = pageTitle(pathname, items);
  const initials = getInitials(user?.email ?? "U", 1);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <Menu aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>FixItNow</SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-4 px-2 pb-4">
                <p className="px-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Workspace
                </p>
                <NavLinks items={items} pathname={pathname} />
                <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
                  <p className="truncate px-2 text-sm">{user?.email}</p>
                  <Button variant="outline" className="w-full" onClick={logout}>
                    <LogOut aria-hidden="true" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {role ? ROLE_LABEL[role] : "Account"} · Workspace
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/services"
            className="hidden items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground md:inline-flex"
          >
            <Search aria-hidden="true" className="size-3.5" />
            Find a pro
          </Link>
          <ThemeToggle />
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card py-1 pr-3 pl-1 sm:flex">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="max-w-[9rem] truncate text-sm text-muted-foreground">
              {user?.email}
            </span>
          </div>
          <Link
            href="/services"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Find a pro"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
