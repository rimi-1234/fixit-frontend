"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateService,
  useUpdateService,
} from "@/hooks/use-services";
import type { Category, Service } from "@/lib/types";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Add a short description (10+ characters)"),
  price: z
    .string()
    .min(1, "Enter a price")
    .refine((value) => {
      const n = Number(value);
      return !Number.isNaN(n) && n >= 0;
    }, "Enter a valid price"),
  categoryId: z.string().min(1, "Choose a category"),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServiceFormDialog({
  open,
  onOpenChange,
  categories,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  service?: Service | null;
}) {
  const createService = useCreateService();
  const updateService = useUpdateService();
  const isEdit = Boolean(service);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? {
            name: service.name,
            description: service.description,
            price: String(service.price),
            categoryId: service.categoryId,
          }
        : {
            name: "",
            description: "",
            price: "",
            categoryId: categories[0]?.id ?? "",
          }
    );
  }, [open, service, categories, reset]);

  const pending = isSubmitting || createService.isPending || updateService.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      categoryId: values.categoryId,
    };

    try {
      if (service) {
        await updateService.mutateAsync({ id: service.id, payload });
      } else {
        await createService.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      applyApiFieldErrors(error, setError, "Failed to save service");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update what customers see when they book this offering."
              : "Create a service customers can book from your public profile."}
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Name</Label>
            <Input
              id="service-name"
              placeholder="AC deep clean"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-category">Category</Label>
            <select
              id="service-category"
              aria-invalid={Boolean(errors.categoryId)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...register("categoryId")}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-price">Price (৳)</Label>
            <Input
              id="service-price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="50"
              aria-invalid={Boolean(errors.price)}
              {...register("price")}
            />
            {errors.price ? (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              rows={3}
              placeholder="What's included, how long it takes, what you need from the customer…"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" form="service-form" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create service"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
