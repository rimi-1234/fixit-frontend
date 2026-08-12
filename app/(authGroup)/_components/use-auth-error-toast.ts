"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { googleAuthErrorMessage } from "@/app/(authGroup)/_components/social-login-buttons";

/** Show a one-time toast for ?error=google_* and strip it from the URL. */
export function useAuthErrorToast(clearPath: "/login" | "/register") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authError) {
      shownRef.current = null;
      return;
    }
    if (shownRef.current === authError) return;

    const message = googleAuthErrorMessage(authError);
    if (!message) return;

    shownRef.current = authError;
    toast.error(message);
    router.replace(clearPath);
  }, [authError, clearPath, router]);
}
