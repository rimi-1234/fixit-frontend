"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight, Menu, Wrench } from "lucide-react";

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
import { NavUserMenu } from "@/components/nav-user-menu";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole, profilePathForRole } from "@/lib/auth-token";
import { ThemeToggle } from "@/components/theme-toggle";

const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Home", id: "home" },
  { href: "/services", label: "Services", id: "services" },
  { href: "/technicians", label: "Technicians", id: "technicians" },
  { href: "/blog", label: "Blog", id: "blog" },
  { href: "/about", label: "About", id: "about" },
] as const;

function activeNavId(pathname: string): string | null {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/technicians")) return "technicians";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/blog")) return "blog";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname === "/") return "home";
  return null;
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, role, user, logout } = useAuth();
  const dashboardHref = role ? dashboardPathForRole(role) : "/login";
  const profileHref = role ? profilePathForRole(role) : "/login";
  const activeId = activeNavId(pathname);

  const navLinks =
    isHydrated && isAuthenticated
      ? [...PUBLIC_NAV_LINKS, { href: dashboardHref, label: "Dashboard", id: "dashboard" as const }]
      : PUBLIC_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 font-semibold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench aria-hidden="true" className="size-4" />
          </span>
          <span className="truncate">FixItNow</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center rounded-full border border-border/70 bg-card/90 p-1 shadow-sm lg:flex"
        >
          {navLinks.map((link) => {
            const showActive = activeId === link.id;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  showActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-primary"
                )}
              >
                {showActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {!isHydrated ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <NavUserMenu
              user={user}
              role={role}
              dashboardHref={dashboardHref}
              profileHref={profileHref}
              onLogout={logout}
            />
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Log in
              </Button>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/services" />}
              >
                Book a service
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />
          {isHydrated && isAuthenticated ? (
            <NavUserMenu
              user={user}
              role={role}
              dashboardHref={dashboardHref}
              profileHref={profileHref}
              onLogout={logout}
            />
          ) : null}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <Menu aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,88vw)] sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/"
                      className="flex items-center gap-2 font-semibold tracking-tight"
                    />
                  }
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Wrench aria-hidden="true" className="size-4" />
                  </span>
                  FixItNow
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => {
                  const active = activeId === link.id;
                  return (
                    <SheetClose
                      key={link.href}
                      nativeButton={false}
                      render={<Link href={link.href} />}
                      className={cn(
                        "rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground"
                      )}
                    >
                      {link.label}
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
                {isAuthenticated ? (
                  <>
                    <SheetClose
                      nativeButton={false}
                      render={<Link href={dashboardHref} />}
                      className={buttonVariants({ variant: "default" })}
                    >
                      Dashboard
                    </SheetClose>
                    <SheetClose
                      nativeButton={false}
                      render={<Link href={profileHref} />}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Profile
                    </SheetClose>
                    <Button variant="outline" onClick={logout}>
                      Log out
                    </Button>
                  </>
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
                      render={<Link href="/services" />}
                      className={buttonVariants({ variant: "default" })}
                    >
                      Book a service
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
