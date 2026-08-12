"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/lib/auth-store";
import { dashboardPathForRole, persistSession } from "@/lib/auth-token";
import { authService } from "@/service/auth.service";

export function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [message, setMessage] = useState("Signing you in with Google…");

  useEffect(() => {
    const error = searchParams.get("error");
    const accessToken = searchParams.get("accessToken");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!accessToken) {
      router.replace("/login?error=google_failed");
      return;
    }

    let cancelled = false;

    persistSession(accessToken, "CUSTOMER");
    authService
      .me()
      .then((user) => {
        if (cancelled) return;
        setSession(accessToken, user);
        router.replace(dashboardPathForRole(user.role));
        router.refresh();
      })
      .catch(() => {
        if (cancelled) return;
        setMessage("Google sign-in failed. Redirecting…");
        router.replace("/login?error=google_failed");
      });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, setSession]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
