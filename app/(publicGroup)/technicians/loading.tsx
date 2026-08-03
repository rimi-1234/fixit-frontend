import { TechnicianCardSkeleton } from "@/app/(publicGroup)/_components/technician-card";

export default function TechniciansLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-2">
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-10 h-28 animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TechnicianCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
