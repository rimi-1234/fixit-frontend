"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, Loader2 } from "lucide-react";

import { TechnicianAvatarPicker } from "@/components/technician-avatar-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useTechnician,
  useUpdateTechnicianProfile,
} from "@/hooks/use-technicians";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";
import { TECHNICIAN_AVATAR_PRESETS } from "@/utils/technician-images";

const profileSchema = z.object({
  skillsText: z
    .string()
    .min(1, "Add at least one skill (comma-separated)")
    .refine(
      (value) =>
        value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean).length > 0,
      "Add at least one skill (comma-separated)"
    ),
  experience: z
    .string()
    .min(1, "Enter years of experience")
    .refine((value) => {
      const n = Number(value);
      return !Number.isNaN(n) && n >= 0;
    }, "Experience must be 0 or more"),
  hourlyRate: z
    .string()
    .min(1, "Enter an hourly rate")
    .refine((value) => {
      const n = Number(value);
      return !Number.isNaN(n) && n >= 0;
    }, "Enter a valid hourly rate"),
  location: z.string().max(120, "Keep location under 120 characters").optional(),
  bio: z.string().max(1000, "Keep bio under 1000 characters").optional(),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("/") ||
        value.startsWith("data:image/") ||
        /^https?:\/\//i.test(value),
      "Enter a valid image URL, path, or upload a photo"
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function TechnicianProfileForm() {
  const { user, isHydrated } = useAuth();
  const {
    data: technician,
    isLoading,
    isError,
    refetch,
  } = useTechnician(user?.id);
  const updateProfile = useUpdateTechnicianProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skillsText: "",
      experience: "",
      hourlyRate: "",
      location: "",
      bio: "",
      imageUrl: TECHNICIAN_AVATAR_PRESETS[0].url,
    },
  });

  const profile = technician?.technicianProfile;
  const imageUrl = useWatch({ control, name: "imageUrl" }) ?? "";

  useEffect(() => {
    if (!profile && !technician) return;
    reset({
      skillsText: profile?.skills?.join(", ") ?? "",
      experience: String(profile?.experience ?? ""),
      hourlyRate: String(profile?.hourlyRate ?? ""),
      location: profile?.location ?? "",
      bio: profile?.bio ?? "",
      imageUrl: profile?.imageUrl ?? TECHNICIAN_AVATAR_PRESETS[0].url,
    });
  }, [profile, technician, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const skills = values.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProfile.mutateAsync({
        skills,
        experience: Number(values.experience),
        hourlyRate: Number(values.hourlyRate),
        location: values.location?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || null,
      });
      reset({
        skillsText: skills.join(", "),
        experience: values.experience,
        hourlyRate: values.hourlyRate,
        location: values.location ?? "",
        bio: values.bio ?? "",
        imageUrl: values.imageUrl ?? "",
      });
    } catch (error) {
      applyApiFieldErrors(error, setError, "Failed to update profile");
    }
  });

  if (!isHydrated || (user?.id && isLoading && !technician)) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <EmptyState
        title="Session loading"
        description="Sign in again if this doesn't resolve."
        action={
          <Button nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        }
      />
    );
  }

  if (isError && !technician) {
    return (
      <EmptyState
        title="Couldn't load profile"
        description="Check that the API is running, then try again."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Photo, skills, rate, and location appear on your public technician page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            nativeButton={false}
            render={<Link href={`/technicians/${user.id}`} target="_blank" />}
          >
            View public profile
            <ExternalLink aria-hidden="true" />
          </Button>
        </div>
        {technician?.averageRating != null ? (
          <p className="text-sm text-muted-foreground">
            {technician.averageRating.toFixed(1)} average ·{" "}
            {technician.reviewCount} review
            {technician.reviewCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {!profile ? (
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            No profile yet — save these details to create one.
          </p>
        ) : null}

        <TechnicianAvatarPicker
          value={imageUrl}
          onChange={(url) =>
            setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })
          }
          error={errors.imageUrl?.message}
        />

        <div className="space-y-1.5">
          <Label htmlFor="skillsText">Skills</Label>
          <Input
            id="skillsText"
            placeholder="Plumbing, Electrical, AC Repair"
            aria-invalid={Boolean(errors.skillsText)}
            {...register("skillsText")}
          />
          <p className="text-xs text-muted-foreground">Comma-separated list</p>
          {errors.skillsText ? (
            <p className="text-sm text-destructive">{errors.skillsText.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              inputMode="numeric"
              aria-invalid={Boolean(errors.experience)}
              {...register("experience")}
            />
            {errors.experience ? (
              <p className="text-sm text-destructive">
                {errors.experience.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hourlyRate">Hourly rate (৳)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.hourlyRate)}
              {...register("hourlyRate")}
            />
            {errors.hourlyRate ? (
              <p className="text-sm text-destructive">
                {errors.hourlyRate.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Dhaka"
            aria-invalid={Boolean(errors.location)}
            {...register("location")}
          />
          {errors.location ? (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Short intro for your public profile"
            aria-invalid={Boolean(errors.bio)}
            {...register("bio")}
          />
          {errors.bio ? (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="submit"
            className="rounded-full"
            disabled={isSubmitting || updateProfile.isPending || !isDirty}
          >
            {isSubmitting || updateProfile.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/dashboard/technician" />}
          >
            Back to overview
          </Button>
        </div>
      </form>
    </div>
  );
}
