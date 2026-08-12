"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DemoRoleLogin } from "@/app/(authGroup)/_components/demo-role-login";
import { SocialLoginButtons, googleAuthErrorMessage } from "@/app/(authGroup)/_components/social-login-buttons";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole } from "@/lib/auth-token";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isHydrated, role, goToDashboard } = useAuth();

  useEffect(() => {
    const message = googleAuthErrorMessage(searchParams.get("error"));
    if (message) toast.error(message);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values);
      toast.success("Welcome back");
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/")
          ? next
          : dashboardPathForRole(result.user.role);
      router.push(destination);
      router.refresh();
    } catch (error) {
      applyApiFieldErrors(error, setError, "Login failed");
    }
  });

  return (
    <div className="space-y-6">
      {isHydrated && isAuthenticated ? (
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm">
          <p className="font-medium">You are already signed in.</p>
          <Button
            className="mt-3 w-full rounded-full"
            type="button"
            onClick={() => goToDashboard(role ?? undefined)}
          >
            Go to dashboard
          </Button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 transition-shadow duration-200 focus-visible:shadow-[0_0_0_4px_oklch(0.47_0.19_264/0.12)]"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-1 h-11 w-full rounded-full transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>

      <SocialLoginButtons />
      <DemoRoleLogin />
    </div>
  );
}
