import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Search, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.04_264)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.05_264)_0%,transparent_55%)]"
      />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </p>
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Search aria-hidden="true" className="size-7" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Error 404</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            That route doesn&apos;t exist or may have moved. Browse services or
            return home to keep going.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button className="rounded-full" nativeButton={false} render={<Link href="/" />}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to home
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Browse services
          </Button>
        </div>
      </div>
    </div>
  );
}
