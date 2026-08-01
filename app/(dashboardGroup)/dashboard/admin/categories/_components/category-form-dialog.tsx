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
import {
  useAdminCreateCategory,
  useAdminUpdateCategory,
} from "@/hooks/use-admin";
import type { Category } from "@/lib/types";
import { applyApiFieldErrors } from "@/utils/apply-api-field-errors";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}) {
  const createCategory = useAdminCreateCategory();
  const updateCategory = useAdminUpdateCategory();
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      category
        ? { name: category.name, slug: category.slug }
        : { name: "", slug: "" }
    );
  }, [open, category, reset]);

  const nameRegister = register("name");
  const pending =
    isSubmitting || createCategory.isPending || updateCategory.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
    };

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      applyApiFieldErrors(error, setError, "Failed to save category");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            Categories group technician services on the public browse page.
          </DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={onSubmit}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="Plumbing"
              aria-invalid={Boolean(errors.name)}
              {...nameRegister}
              onChange={(event) => {
                void nameRegister.onChange(event);
                if (!isEdit && !dirtyFields.slug) {
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: Boolean(getValues("slug")),
                  });
                }
              }}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              placeholder="plumbing"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            <p className="text-xs text-muted-foreground">
              URL-safe identifier. Auto-fills from the name until you edit it.
            </p>
            {errors.slug ? (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
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
          <Button type="submit" form="category-form" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
