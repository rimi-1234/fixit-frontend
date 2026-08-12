import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { GoogleAuthCallback } from "@/app/auth/callback/_components/google-auth-callback";

export const metadata: Metadata = {
  title: "Signing in",
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <GoogleAuthCallback />
    </Suspense>
  );
}
