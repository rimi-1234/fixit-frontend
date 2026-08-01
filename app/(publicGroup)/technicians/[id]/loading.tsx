import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianProfileLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-6 lg:py-14">
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full sm:size-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="hidden h-80 w-full lg:block" />
    </div>
  );
}
