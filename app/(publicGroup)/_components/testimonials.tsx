"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { apiFetch } from "@/lib/api-client";
import { EmptyState } from "@/components/empty-state";
import { displayNameFromEmail } from "@/utils/display-name";
import { Wrench } from "lucide-react";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    email: string;
    name: string | null;
  };
};

const DEFAULT_LIMIT = 6;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-reviews", DEFAULT_LIMIT],
    queryFn: () =>
      apiFetch<ReviewItem[]>(`/api/reviews?limit=${DEFAULT_LIMIT}`, {
        skipAuth: true,
        sameOrigin: true,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const reviews = data ?? [];

  return (
    <section className="border-y border-border/50 bg-muted/25 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 space-y-2 text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              Testimonials
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What our customers say
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Thousands of homeowners and property managers trust FixItNow to get
              the job done right, every time.
            </p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <div className="h-5 w-20 rounded bg-muted-foreground/20 animate-pulse" />
                <div className="h-14 w-full rounded bg-muted-foreground/20 animate-pulse" />
                <div className="mt-2 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-muted-foreground/20 animate-pulse" />
                  <div className="min-w-0">
                    <div className="h-4 w-28 rounded bg-muted-foreground/20 animate-pulse" />
                    <div className="mt-2 h-3 w-20 rounded bg-muted-foreground/20 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Wrench}
            title="Couldn't load testimonials"
            description="Check that the API is running and try again."
            action={
              <motion.button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-medium bg-primary/10 text-primary"
                onClick={() => refetch()}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Retry
              </motion.button>
            }
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No reviews yet"
            description="When customers complete jobs, their feedback will appear here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => {
              const displayName =
                r.customer.name?.trim() || displayNameFromEmail(r.customer.email);
              const comment = r.comment?.trim();
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
                >
                  <StarRow rating={r.rating} />
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {comment ? `“${comment}”` : "No written comment."}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {displayNameFromEmail(r.customer.email).charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
