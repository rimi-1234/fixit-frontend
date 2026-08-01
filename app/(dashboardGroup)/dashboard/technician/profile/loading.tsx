import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianProfileLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
