"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useMyBookings } from "@/hooks/use-bookings";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_TOAST: Partial<Record<BookingStatus, string>> = {
  ACCEPTED: "A technician accepted your booking — you can pay now.",
  DECLINED: "A booking request was declined.",
  PAID: "Payment confirmed — your booking is paid.",
  IN_PROGRESS: "A technician marked your job in progress.",
  COMPLETED: "A job was completed — you can leave a review.",
  CANCELLED: "A booking was cancelled.",
};

/**
 * Polls the customer's bookings and toasts when status changes
 * (e.g. technician accept / start / complete) without a full page reload.
 */
export function useBookingStatusToasts(enabled = true) {
  const { data } = useMyBookings({
    refetchInterval: enabled ? 12_000 : false,
  });
  const previous = useRef<Map<string, BookingStatus>>(new Map());
  const ready = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const list = data ?? [];
    if (!ready.current) {
      previous.current = new Map(
        list.map((booking) => [booking.id, booking.status])
      );
      ready.current = true;
      return;
    }

    for (const booking of list) {
      const before = previous.current.get(booking.id);
      if (before && before !== booking.status) {
        const message = STATUS_TOAST[booking.status];
        if (message) {
          const name = booking.service?.name;
          toast.info(name ? `${name}: ${message}` : message);
        }
      }
    }

    previous.current = new Map(
      list.map((booking: Booking) => [booking.id, booking.status])
    );
  }, [data, enabled]);
}
