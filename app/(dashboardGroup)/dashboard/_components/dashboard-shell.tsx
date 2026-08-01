"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Users,
  Wrench,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
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
        const isExactOverview =
          item.href.endsWith("/customer") ||
          item.href.endsWith("/technician") ||
          item.href.endsWith("/admin");

        const isActive = isExactOverview
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
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

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-6 px-3 py-2">
        <NavLinks items={items} pathname={pathname} />
      </div>
      <div className="space-y-3 border-t border-border/60 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.email ?? "Signed in"}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {role?.toLowerCase()}
          </p>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={logout}>
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

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border/60 px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>FixItNow</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 px-2 pb-4">
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
        <Link href="/" className="font-semibold tracking-tight">
          FixItNow
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hidden sm:inline-flex"
          )}
        >
          Browse services
        </Link>
        <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground md:inline">
          {user?.email}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {role?.toLowerCase()}
        </span>
      </div>
    </header>
  );
}
