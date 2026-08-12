"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, Wrench } from "lucide-react";
import { motion } from "motion/react";

import { serviceService } from "@/service/service.service";
import { formatCurrency } from "@/utils/format-currency";
import { serviceImageUrl } from "@/utils/service-images";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { displayNameFromEmail } from "@/utils/display-name";
import { technicianImageUrl } from "@/utils/technician-images";
import { ServiceCard, ServiceCardSkeleton } from "@/app/(publicGroup)/_components/service-card";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`size-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: service, isLoading, isError, refetch } = useQuery({
    queryKey: ["service", id],
    queryFn: () => serviceService.getById(id),
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <div className="h-6 w-32 animate-pulse rounded bg-muted mb-6" />
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (isError || !service) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-lg font-semibold tracking-tight">Service not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This listing may have been removed, or the API could not load it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
            <Button nativeButton={false} render={<Link href="/services" />}>
              Browse services
            </Button>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const imageSrc = serviceImageUrl(service);
  const techName = service.technician?.email ? displayNameFromEmail(service.technician.email) : "Technician";
  const techPhoto = technicianImageUrl({
    id: service.technician?.id ?? service.technicianId,
    email: service.technician?.email ?? "",
    technicianProfile: service.technician?.technicianProfile,
  });
  const rating = service.technician?.averageRating ?? 0;
  const reviews = service.technician?.reviews ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/services"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to services
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left – main content */}
          <div className="space-y-8">
            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={imageSrc}
                alt={service.name}
                fill
                priority
                sizes="(min-width: 1024px) 65vw, 100vw"
                className="object-cover"
                unoptimized={shouldUnoptimizeImage(imageSrc)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {service.category?.name}
              </span>
            </motion.div>

            {/* Description */}
            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">Overview</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Reviews{" "}
                <span className="text-base font-normal text-muted-foreground">
                  ({reviews.length})
                </span>
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                          <Wrench aria-hidden="true" className="size-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {r.customer?.email ? displayNameFromEmail(r.customer.email) : "Customer"}
                          </p>
                          <StarRow rating={r.rating} />
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Related services */}
            {service.related && service.related.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Related services</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {service.related.slice(0, 4).map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right – booking panel */}
          <aside className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <h1 className="text-xl font-semibold tracking-tight">{service.name}</h1>
              <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(service.price)}</p>

              <div className="my-4 flex items-center gap-0.5">
                <StarRow rating={rating} />
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {rating > 0 ? `${rating.toFixed(1)} (${reviews.length})` : "No reviews yet"}
                </span>
              </div>

              <Button
                className="w-full rounded-full"
                nativeButton={false}
                render={
                  <Link href={`/technicians/${service.technicianId}`} />
                }
              >
                Book this service
              </Button>

              <hr className="my-4 border-border/50" />

              {/* Technician info */}
              <Link
                href={`/technicians/${service.technician?.id ?? service.technicianId}`}
                className="group flex items-center gap-3"
              >
                <span className="relative inline-block size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-border/60">
                  <Image
                    src={techPhoto}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                    unoptimized={shouldUnoptimizeImage(techPhoto)}
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:underline">{techName}</p>
                  <p className="text-xs text-muted-foreground">Verified technician</p>
                  {service.technician?.technicianProfile?.location && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin aria-hidden="true" className="size-3 shrink-0" />
                      {service.technician.technicianProfile.location}
                    </p>
                  )}
                </div>
              </Link>

              {service.technician?.technicianProfile?.bio && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {service.technician.technicianProfile.bio}
                </p>
              )}

              {service.technician?.technicianProfile?.skills && service.technician.technicianProfile.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.technician.technicianProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </aside>
        </div>
      </div>

      <div className="mt-12">
        <SiteFooter />
      </div>
    </main>
  );
}
