"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole } from "@/lib/auth-token";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { role } = useAuth();
  const dashboardHref = role ? dashboardPathForRole(role) : "/";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
      <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "This dashboard view failed to load."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={dashboardHref} />}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
