import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentCancelView } from "@/app/(publicGroup)/payment/cancel/_components/payment-cancel";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md space-y-3 py-16">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
            <Skeleton className="mx-auto h-5 w-40" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
        }
      >
        <PaymentCancelView />
      </Suspense>
    </main>
  );
}
