import type { Metadata } from "next";
import { Suspense } from "react";
import { Wrench } from "lucide-react";

import { PaymentCancelView } from "@/app/(publicGroup)/payment/cancel/_components/payment-cancel";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16">
          <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
            <Wrench aria-hidden="true" className="size-4" />
            FixItNow
          </p>
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      }
    >
      <PaymentCancelView />
    </Suspense>
  );
}
