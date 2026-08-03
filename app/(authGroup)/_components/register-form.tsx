"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RoleToggle } from "@/app/(authGroup)/_components/role-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CUSTOMER", "TECHNICIAN"]),
    skillsText: z.string().optional(),
    experience: z.string().optional(),
    hourlyRate: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "TECHNICIAN") return;

    const skills = (data.skillsText ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["skillsText"],
        message: "Add at least one skill (comma-separated)",
      });
    }

    const experience = Number(data.experience);
    if (data.experience === undefined || data.experience === "" || Number.isNaN(experience) || experience < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["experience"],
        message: "Enter years of experience (0 or more)",
      });
    }

    const hourlyRate = Number(data.hourlyRate);
    if (
      data.hourlyRate === undefined ||
      data.hourlyRate === "" ||
      Number.isNaN(hourlyRate) ||
      hourlyRate < 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["hourlyRate"],
        message: "Enter a valid hourly rate",
      });
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "CUSTOMER",
      skillsText: "",
      experience: "",
      hourlyRate: "",
      bio: "",
      location: "",
    },
  });

  const role = useWatch({ control, name: "role" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const skills = (values.skillsText ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await registerUser({
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.role === "TECHNICIAN"
          ? {
              skills,
              experience: Number(values.experience),
              hourlyRate: Number(values.hourlyRate),
              bio: values.bio || undefined,
              location: values.location || undefined,
            }
          : {}),
      });

      toast.success("Account created — sign in to continue");
      router.push("/login");
    } catch (error) {
      applyApiFieldErrors(error, setError, "Registration failed");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label>I want to join as</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleToggle value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.role ? (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {role === "TECHNICIAN" ? (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <p className="text-sm text-muted-foreground">
            Tell customers what you offer. Skills, experience, and rate are required.
          </p>

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
                <p className="text-sm text-destructive">{errors.experience.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hourlyRate">Hourly rate</Label>
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
                <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
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
              rows={3}
              placeholder="Short intro for your profile"
              aria-invalid={Boolean(errors.bio)}
              {...register("bio")}
            />
            {errors.bio ? (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
