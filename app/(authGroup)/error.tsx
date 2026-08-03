"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AuthError({
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
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-8">
      <p className="text-sm font-medium text-primary">FixItNow</p>
      <h2 className="text-xl font-semibold tracking-tight">
        Couldn&apos;t load this form
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong while loading sign-in."}
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
