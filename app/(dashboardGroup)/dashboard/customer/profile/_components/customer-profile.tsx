"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogOut, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { authService } from "@/service/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/motion/reveal";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/utils/get-initials";
import { displayNameFromEmail } from "@/utils/display-name";

const schema = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => value === "" || value.length >= 2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[+\d\s()-]{7,20}$/.test(value),
      "Enter a valid phone number"
    ),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("/") ||
        value.startsWith("data:image/") ||
        /^https?:\/\//i.test(value),
      "Enter a valid image URL"
    ),
});
type FormValues = z.infer<typeof schema>;

function profileFields(user: Record<string, unknown> | null | undefined) {
  return {
    name: typeof user?.name === "string" ? user.name : "",
    phone: typeof user?.phone === "string" ? user.phone : "",
    imageUrl: typeof user?.imageUrl === "string" ? user.imageUrl : "",
  };
}

export function CustomerProfilePage() {
  const { user, role, logout } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const initials = getInitials(user?.email ?? "U", 1);
  const displayName =
    (user && "name" in user && typeof user.name === "string" && user.name.trim()) ||
    displayNameFromEmail(user?.email);
  const imageUrl =
    user && "imageUrl" in user && typeof user.imageUrl === "string" ? user.imageUrl : "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: profileFields(user as Record<string, unknown> | null),
  });

  useEffect(() => {
    reset(profileFields(user as Record<string, unknown> | null));
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      authService.updateProfile({
        name: data.name || null,
        phone: data.phone || null,
        imageUrl: data.imageUrl || null,
      }),
    onSuccess: (updated) => {
      if (user) {
        setUser({ ...user, ...updated });
      }
      reset({
        name: updated.name ?? "",
        phone: updated.phone ?? "",
        imageUrl: updated.imageUrl ?? "",
      });
      toast.success("Profile updated successfully.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to update profile. Try again.";
      toast.error(message);
    },
  });

  async function onSubmit(data: FormValues) {
    await mutation.mutateAsync(data);
  }

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <h3 className="text-sm font-semibold tracking-tight">Edit information</h3>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email ?? ""} disabled className="opacity-70" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" placeholder="Your full name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01783540827"
              {...register("phone")}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Profile image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://…"
              {...register("imageUrl")}
              aria-invalid={!!errors.imageUrl}
            />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" disabled={!isDirty || isSubmitting} className="rounded-full gap-1.5">
              <Save aria-hidden="true" className="size-3.5" />
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
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
        </form>
      </Reveal>
    </div>
  );
}
