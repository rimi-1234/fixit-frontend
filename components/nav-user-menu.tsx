"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, User, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser, Role, User as AuthUserType } from "@/lib/types";
import { cn } from "@/lib/utils";

function profileImage(user: AuthUser | AuthUserType | null | undefined) {
  if (!user) return null;
  if ("imageUrl" in user && user.imageUrl) return user.imageUrl as string;
  if ("technicianProfile" in user)
    return (user.technicianProfile as { imageUrl?: string | null } | null)?.imageUrl || null;
  return null;
}

function roleLabel(role: Role | null | undefined) {
  if (!role) return "Member";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

/** Friendly display name from email local-part when no profile name exists. */
function displayName(email: string | undefined | null) {
  if (!email) return "Account";
  const local = email.split("@")[0] || "Account";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function NavUserMenu({
  user,
  role,
  dashboardHref,
  profileHref,
  onLogout,
  className,
}: {
  user: AuthUser | AuthUserType | null;
  role: Role | null;
  dashboardHref: string;
  profileHref: string;
  onLogout: () => void;
  className?: string;
}) {
  const router = useRouter();
  const imageUrl = profileImage(user);
  const email = user?.email ?? "Signed in";
  const name =
    (user && "name" in user && user.name?.trim()) || displayName(user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex max-w-[14rem] items-center gap-2 rounded-full border border-border/70 bg-card/80 p-0.5 pr-2.5 shadow-sm outline-none transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-primary/40 data-popup-open:shadow-md",
          className
        )}
      >
        <Avatar size="default" className="size-8 shrink-0 ring-2 ring-background">
          {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary/12 text-primary">
            <UserRound aria-hidden="true" className="size-4" />
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold leading-tight tracking-tight">
            {name}
          </span>
          <span className="block truncate text-[11px] leading-tight text-muted-foreground">
            {roleLabel(role)}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180"
        />
        <span className="sr-only">Open account menu for {name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[80] min-w-56 w-56 rounded-2xl p-1.5 shadow-lg ring-1 ring-foreground/10"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 py-2.5 font-normal">
            <div className="flex items-center gap-2.5">
              <Avatar size="default" className="size-9">
                {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
                <AvatarFallback className="bg-primary/12 text-primary">
                  <UserRound aria-hidden="true" className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{roleLabel(role)}</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-sm"
            onClick={() => router.push(dashboardHref)}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <LayoutDashboard aria-hidden="true" className="size-3.5" />
            </span>
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-sm"
            onClick={() => router.push(profileHref)}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <User aria-hidden="true" className="size-3.5" />
            </span>
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-sm"
            onClick={onLogout}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <LogOut aria-hidden="true" className="size-3.5" />
            </span>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
