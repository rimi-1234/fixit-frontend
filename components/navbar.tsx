"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole } from "@/lib/auth-token";

const NAV_LINKS = [{ href: "/services", label: "Services" }];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, role, user, logout } = useAuth();
  const dashboardHref = role ? dashboardPathForRole(role) : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Wrench aria-hidden="true" className="size-5 text-primary" />
          <span>FixItNow</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isHydrated ? (
            <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href={dashboardHref} />}
              >
                <LayoutDashboard aria-hidden="true" />
                Dashboard
              </Button>
              <span className="max-w-[10rem] truncate text-sm text-muted-foreground">
                {user?.email ?? "Signed in"}
              </span>
              <Button variant="outline" onClick={logout}>
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Log in
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                Get started
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={<Link href={link.href} />}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </SheetClose>
              ))}
              {isAuthenticated ? (
                <SheetClose
                  nativeButton={false}
                  render={<Link href={dashboardHref} />}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Dashboard
                </SheetClose>
              ) : null}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
              {isAuthenticated ? (
                <Button variant="outline" onClick={logout}>
                  Log out
                </Button>
              ) : (
                <>
                  <SheetClose
                    nativeButton={false}
                    render={<Link href="/login" />}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Log in
                  </SheetClose>
                  <SheetClose
                    nativeButton={false}
                    render={<Link href="/register" />}
                    className={buttonVariants({ variant: "default" })}
                  >
                    Get started
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
