"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Root-level fatal error UI (replaces the whole document when needed). */
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white px-4 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto flex max-w-md flex-col items-start gap-4">
          <p className="text-sm font-semibold text-indigo-600">FixItNow</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {error.message ||
              "A server error occurred. You can try again or reload the page."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
