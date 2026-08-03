"use client";

import { Star, Users, Wrench } from "lucide-react";

import { Float, RevealGroup, RevealItem } from "@/components/motion/reveal";
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
    <section className="border-b border-border/40">
      <RevealGroup
        as="div"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:gap-0 sm:px-6 sm:py-14"
      >
        {items.map((item, index) => (
          <RevealItem
            key={item.label}
            as="div"
            className={`flex items-start gap-3 sm:px-8 ${
              index > 0 ? "sm:border-l sm:border-border/50" : "sm:pl-0"
            }`}
          >
            <Float distance={5} duration={4.2} delay={index * 0.2}>
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <item.icon aria-hidden="true" className="size-4" />
              </span>
            </Float>
            <div>
              {item.value === null ? (
                <Skeleton className="mb-2 h-7 w-12" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight">
                  {item.value}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
