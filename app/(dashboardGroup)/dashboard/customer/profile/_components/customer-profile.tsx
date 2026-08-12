"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { AccountProfileForm } from "@/app/(dashboardGroup)/dashboard/_components/account-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/utils/get-initials";
import { displayNameFromEmail } from "@/utils/display-name";

export function CustomerProfilePage() {
  const { user, role, logout } = useAuth();
  const initials = getInitials(user?.email ?? "U", 1);
  const displayName =
    (user && "name" in user && typeof user.name === "string" && user.name.trim()) ||
    displayNameFromEmail(user?.email);
  const imageUrl =
    user && "imageUrl" in user && typeof user.imageUrl === "string" ? user.imageUrl : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h2>
        <p className="text-sm text-muted-foreground">Update your account details.</p>
      </Reveal>

      <Reveal className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <Avatar className="size-14">
          {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {role?.toLowerCase()} workspace
          </p>
        </div>
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <AccountProfileForm />
      </Reveal>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          type="button"
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          Browse services
        </Button>
        <Button variant="ghost" type="button" className="rounded-full ml-auto" onClick={logout}>
          <LogOut aria-hidden="true" />
          Log out
        </Button>
      </div>
    </div>
  );
}
