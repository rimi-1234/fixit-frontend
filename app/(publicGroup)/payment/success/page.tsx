import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2, Wrench } from "lucide-react";

import { PaymentSuccessView } from "@/app/(publicGroup)/payment/success/_components/payment-success";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Confirming your FixItNow checkout and booking payment status.",
};

function SuccessFallback() {
  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </p>
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-lg font-semibold tracking-tight">
            Confirming your payment…
          </p>
          <p className="text-sm text-muted-foreground">
            Syncing with the payment provider
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <PaymentSuccessView />
    </Suspense>
  );
}
