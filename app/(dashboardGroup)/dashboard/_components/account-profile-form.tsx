"use client";

import { useEffect } from "react";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { authService } from "@/service/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

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

export function AccountProfileForm({
  title = "Edit information",
}: {
  title?: string;
}) {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

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

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutateAsync(data))}
      className="space-y-5"
      noValidate
    >
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>

      <div className="space-y-1.5">
        <Label htmlFor="account-email">Email</Label>
        <Input
          id="account-email"
          type="email"
          value={user?.email ?? ""}
          disabled
          className="opacity-70"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="account-name">Display name</Label>
        <Input
          id="account-name"
          placeholder="Your full name"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="account-phone">Phone number</Label>
        <Input
          id="account-phone"
          type="tel"
          placeholder="01783540827"
          {...register("phone")}
          aria-invalid={!!errors.phone}
        />
        {errors.phone ? (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="account-imageUrl">Profile image URL</Label>
        <Input
          id="account-imageUrl"
          type="url"
          placeholder="https://…"
          {...register("imageUrl")}
          aria-invalid={!!errors.imageUrl}
        />
        {errors.imageUrl ? (
          <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="rounded-full gap-1.5"
      >
        <Save aria-hidden="true" className="size-3.5" />
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
