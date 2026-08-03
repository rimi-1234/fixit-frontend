"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2 } from "lucide-react";

import { OptimizedImageUpload } from "@/components/optimized-image-upload";
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
import { cn } from "@/lib/utils";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";
import { isValidImageRef, shouldUnoptimizeImage } from "@/utils/image-src";
import {
  SERVICE_IMAGE_PRESETS,
  imageForCategory,
} from "@/utils/service-images";

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
  imageUrl: z
    .string()
    .trim()
    .refine(isValidImageRef, "Enter a valid image URL, path, or upload a photo"),
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
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
    },
  });

  const imageUrl = useWatch({ control, name: "imageUrl" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const previewSrc =
    imageUrl || imageForCategory(selectedCategory?.name) || SERVICE_IMAGE_PRESETS[0].url;

  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? {
            name: service.name,
            description: service.description,
            price: String(service.price),
            categoryId: service.categoryId,
            imageUrl: service.imageUrl ?? "",
          }
        : {
            name: "",
            description: "",
            price: "",
            categoryId: categories[0]?.id ?? "",
            imageUrl: imageForCategory(categories[0]?.name),
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
      imageUrl: values.imageUrl.trim() || null,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update what customers see when they book this offering."
              : "Create a service customers can book from your public profile."}
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Cover image</Label>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={previewSrc}
                alt=""
                fill
                sizes="480px"
                className="object-cover"
                unoptimized={shouldUnoptimizeImage(previewSrc)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <ImagePlus aria-hidden="true" className="size-3.5" />
                Preview
              </span>
            </div>

            <OptimizedImageUpload
              label="Upload cover photo"
              optimize={{ maxWidth: 1400, maxHeight: 900, quality: 0.8 }}
              onUploaded={(url) =>
                setValue("imageUrl", url, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={pending}
            />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SERVICE_IMAGE_PRESETS.map((preset) => {
                const selected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setValue("imageUrl", preset.url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl ring-offset-background transition",
                      selected
                        ? "ring-2 ring-primary ring-offset-2"
                        : "ring-1 ring-border/70 hover:ring-primary/40"
                    )}
                    aria-label={`Use ${preset.label} image`}
                    aria-pressed={selected}
                  >
                    <Image
                      src={preset.url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-image">Or paste image URL</Label>
              <Input
                id="service-image"
                placeholder="https://images.unsplash.com/…"
                aria-invalid={Boolean(errors.imageUrl)}
                {...register("imageUrl")}
              />
              {errors.imageUrl ? (
                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload a photo, pick a preset, or paste a public link.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-name">Name</Label>
            <Input
              id="service-name"
              className="h-11"
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
              className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...register("categoryId", {
                onChange: (event) => {
                  const next = categories.find((c) => c.id === event.target.value);
                  const current = imageUrl;
                  const isPreset = SERVICE_IMAGE_PRESETS.some((p) => p.url === current);
                  if (!current || isPreset) {
                    setValue("imageUrl", imageForCategory(next?.name), {
                      shouldDirty: true,
                    });
                  }
                },
              })}
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
              className="h-11"
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
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="service-form"
            className="rounded-full"
            disabled={pending}
          >
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
