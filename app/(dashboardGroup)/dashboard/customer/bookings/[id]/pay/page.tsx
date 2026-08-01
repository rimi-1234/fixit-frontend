import type { Metadata } from "next";

import { PayBookingView } from "@/app/(dashboardGroup)/dashboard/customer/bookings/[id]/pay/_components/pay-booking";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Pay for booking",
};

export default async function PayBookingPage({ params }: PageProps) {
  const { id } = await params;
  return <PayBookingView bookingId={id} />;
}
