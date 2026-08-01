"use client";

import { Star, Users, Wrench } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/use-services";
import { useTechnicians } from "@/hooks/use-technicians";

export function TrustStrip() {
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians();

  const isLoading = servicesLoading || techniciansLoading;
  const serviceCount = services?.length ?? 0;
  const techCount = technicians?.length ?? 0;
  const avgRating =
    technicians && technicians.length > 0
      ? (
          technicians.reduce((sum, t) => sum + (t.averageRating || 0), 0) /
          technicians.length
        ).toFixed(1)
      : "—";

  const items = [
    {
      icon: Wrench,
      label: "Services listed",
      value: isLoading ? null : String(serviceCount),
    },
    {
      icon: Users,
      label: "Active technicians",
      value: isLoading ? null : String(techCount),
    },
    {
      icon: Star,
      label: "Average rating",
      value: isLoading ? null : String(avgRating),
    },
  ];

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 sm:py-12">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <item.icon
              aria-hidden="true"
              className="mt-0.5 size-5 text-muted-foreground"
            />
            <div>
              {item.value === null ? (
                <Skeleton className="mb-2 h-7 w-12" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
              )}
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
