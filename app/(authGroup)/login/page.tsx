import type { Metadata } from "next";
import { Suspense } from "react";
import { Wrench } from "lucide-react";

import { LoginForm } from "@/app/(authGroup)/_components/login-form";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Reveal className="space-y-8">
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sign in to manage bookings, jobs, and your FixItNow dashboard.
          </p>
        </div>
      </div>
      <Suspense
        fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/70" />}
      >
        <LoginForm />
      </Suspense>
    </Reveal>
  );
}
