"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";

import { ServiceFormDialog } from "@/app/(dashboardGroup)/dashboard/technician/services/_components/service-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteService } from "@/hooks/use-services";
import { useTechnician } from "@/hooks/use-technicians";
import type { Service } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { serviceImageUrl } from "@/utils/service-images";

export function TechnicianServicesManager() {
  const { user, isHydrated } = useAuth();
  const {
    data: technician,
    isLoading,
    isError,
    refetch,
  } = useTechnician(user?.id);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteService = useDeleteService();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const services = technician?.services ?? [];
  const categoryList = categories ?? [];

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast in mutation
    } finally {
      setDeleting(false);
    }
  }

  if (!isHydrated || (user?.id && isLoading && !technician)) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <EmptyState
        title="Session loading"
        description="Sign in again if this doesn't resolve."
        action={
          <Button nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        }
      />
    );
  }

  if (isError && !technician) {
    return (
      <EmptyState
        title="Couldn't load services"
        description="Check that the API is running, then try again."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={`Delete “${deleteTarget?.name ?? "service"}”?`}
        description="Customers won’t be able to book it anymore."
        confirmLabel="Delete service"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Services
          </h1>
          <p className="text-sm text-muted-foreground">
            Offerings customers can book from your public profile.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={categoriesLoading || categoryList.length === 0}
        >
          <Plus aria-hidden="true" />
          Add service
        </Button>
      </div>

      {!categoriesLoading && categoryList.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories exist yet. Ask an admin to create categories before you
          can add services.
        </p>
      ) : null}

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services yet"
          description="Add your first offering so customers have something to book."
          action={
            <Button
              type="button"
              onClick={openCreate}
              disabled={categoryList.length === 0}
            >
              <Plus aria-hidden="true" />
              Add service
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {services.map((service) => {
            const thumb = serviceImageUrl(service);
            return (
            <li
              key={service.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={shouldUnoptimizeImage(thumb)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium tracking-tight">{service.name}</p>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {service.category?.name ?? "Uncategorized"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(service)}
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget(service)}
                  disabled={deleteService.isPending}
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        nativeButton={false}
        render={<Link href="/dashboard/technician" />}
      >
        Back to overview
      </Button>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        categories={categoryList}
        service={editing}
      />
    </div>
  );
}
