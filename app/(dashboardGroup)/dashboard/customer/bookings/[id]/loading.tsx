import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
