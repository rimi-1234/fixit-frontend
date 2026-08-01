import Link from "next/link";
import type { Metadata } from "next";
import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-start justify-center gap-5 px-4 py-16">
      <div className="flex items-center gap-2 font-semibold tracking-tight">
        <Wrench aria-hidden="true" className="size-5 text-primary" />
        FixItNow
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          That route doesn&apos;t exist or may have moved. Browse services or return home.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href="/" />}>
          Back to home
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          Browse services
        </Button>
      </div>
    </div>
  );
}
