"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import type { Role } from "@/lib/types";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 fill-[#1877F2]">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.027 4.388 11.022 10.124 11.927v-8.43H7.078v-3.497h3.046V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.967H15.83c-1.49 0-1.953.927-1.953 1.878v2.255h3.328l-.532 3.497H13.877v8.43C19.612 23.095 24 18.1 24 12.073z"/>
    </svg>
  );
}

type SocialLoginButtonsProps = {
  role?: Extract<Role, "CUSTOMER" | "TECHNICIAN">;
  from?: "login" | "register";
};

export function googleAuthErrorMessage(code: string | null) {
  switch (code) {
    case "google_not_configured":
      return "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then try again.";
    case "google_denied":
      return "Google sign-in was cancelled.";
    case "google_banned":
      return "This Google account is linked to a banned FixItNow user. Ask an admin to restore access, or sign in with a different Google account.";
    case "google_failed":
      return "Google sign-in failed. Please try again.";
    default:
      return null;
  }
}

export function SocialLoginButtons({
  role = "CUSTOMER",
  from = "login",
}: SocialLoginButtonsProps) {
  const [googlePending, setGooglePending] = useState(false);

  function handleGoogle() {
    setGooglePending(true);
    const params = new URLSearchParams({ role, from });
    window.location.href = `/api/auth/google?${params.toString()}`;
  }

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border/60" />
        <span className="shrink-0 text-xs text-muted-foreground">or continue with</span>
        <div className="flex-1 border-t border-border/60" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          disabled={googlePending}
          onClick={handleGoogle}
          className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-md disabled:opacity-70"
        >
          <GoogleIcon />
          {googlePending ? "Redirecting…" : "Google"}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            toast.info("Facebook login coming soon. Use Google, email, or a demo account for now.")
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-md"
        >
          <FacebookIcon />
          Facebook
        </motion.button>
      </div>
    </div>
  );
}
