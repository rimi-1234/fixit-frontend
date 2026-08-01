import { Skeleton } from "@/components/ui/skeleton";

export default function PayBookingLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
