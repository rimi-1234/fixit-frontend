"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export function PaymentCancelView() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <EmptyState
      icon={XCircle}
      title="Payment cancelled"
      description="No charge was made. You can try again whenever you're ready, or return to your bookings."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {bookingId ? (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`/dashboard/customer/bookings/${bookingId}/pay`}
                />
              }
            >
              Try again
            </Button>
          ) : null}
          <Button
            variant="outline"
            nativeButton={false}
            render={
              bookingId ? (
                <Link href={`/dashboard/customer/bookings/${bookingId}`} />
              ) : (
                <Link href="/dashboard/customer" />
              )
            }
          >
            {bookingId ? "View booking" : "My bookings"}
          </Button>
        </div>
      }
    />
  );
}
