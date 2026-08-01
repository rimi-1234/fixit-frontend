"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
      <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "This dashboard view failed to load."}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/customer")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
