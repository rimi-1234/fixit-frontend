import type { Metadata } from "next";

import { BookingDetailView } from "@/app/(dashboardGroup)/dashboard/customer/bookings/[id]/_components/booking-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Booking details",
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
