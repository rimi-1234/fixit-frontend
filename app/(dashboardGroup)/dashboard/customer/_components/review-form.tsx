"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";

const reviewSchema = z.object({
  rating: z
    .number({ error: "Choose a rating" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .max(1000, "Keep comments under 1000 characters")
    .optional()
    .or(z.literal("")),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export function ReviewForm({
  bookingId,
  technicianId,
}: {
  bookingId: string;
  technicianId?: string;
}) {
  const createReview = useCreateReview();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createReview.mutateAsync({
        bookingId,
        rating: values.rating,
        comment: values.comment?.trim() || undefined,
        technicianId,
      });
    } catch (error) {
      applyApiFieldErrors(error, setError, "Failed to submit review");
    }
  });

  return (
    <form
      id="review"
      onSubmit={onSubmit}
      className="scroll-mt-24 space-y-5 border-t border-border/60 pt-6"
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Leave a review</h2>
        <p className="text-sm text-muted-foreground">
          Share how the job went so other customers can decide.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= field.value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={field.value === value}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      active
                        ? "text-amber-500"
                        : "text-muted-foreground/40 hover:text-muted-foreground"
                    )}
                  >
                    <Star
                      className="size-7"
                      fill={active ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">
                {RATING_LABELS[field.value] ?? ""}
              </span>
            </div>
          )}
        />
        {errors.rating ? (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-comment">Comment (optional)</Label>
        <Textarea
          id="review-comment"
          rows={3}
          placeholder="Professional, on time, fixed the issue quickly…"
          aria-invalid={Boolean(errors.comment)}
          {...register("comment")}
        />
        {errors.comment ? (
          <p className="text-sm text-destructive">{errors.comment.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting || createReview.isPending}>
        {isSubmitting || createReview.isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}
