import {
  ServiceCardSkeleton,
} from "@/app/(publicGroup)/_components/service-card";
import {
  TechnicianCardSkeleton,
} from "@/app/(publicGroup)/_components/technician-card";

export default function PublicHomeLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-16">
      <div className="space-y-3">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ServiceCardSkeleton key={`s-${i}`} />
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <TechnicianCardSkeleton key={`t-${i}`} />
        ))}
      </div>
    </div>
  );
}
