import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { PaymentSuccessView } from "@/app/(publicGroup)/payment/success/_components/payment-success";

export const metadata: Metadata = {
  title: "Payment success",
};

function SuccessFallback() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm font-medium">Confirming your payment…</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Suspense fallback={<SuccessFallback />}>
        <PaymentSuccessView />
      </Suspense>
    </main>
  );
}
