"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-sm font-medium text-primary">FixItNow</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        This page hit a snag
      </h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong while loading this page."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" onClick={reset}>
          Try again
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
