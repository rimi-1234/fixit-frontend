"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";

import { ServiceFormDialog } from "@/app/(dashboardGroup)/dashboard/technician/services/_components/service-form-dialog";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteService } from "@/hooks/use-services";
import { useTechnician } from "@/hooks/use-technicians";
import { usePagination } from "@/hooks/use-pagination";
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

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const services = technician?.services ?? [];
  const categoryList = categories ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      if (categoryId && service.categoryId !== categoryId) return false;
      if (!query) return true;
      return [service.name, service.description, service.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [services, search, categoryId]);
  const { page, setPage, totalPages, paged } = usePagination(filtered, 8);

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
        <>
          <FilterBar>
            <FilterSearch
              id="tech-services-search"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Name or description…"
            />
            <FilterSelect
              id="tech-services-category"
              label="Category"
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All categories" },
                ...categoryList.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
            />
          </FilterBar>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No matching services"
              description="Try another search or category filter."
            />
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((service) => {
                    const thumb = serviceImageUrl(service);
                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized={shouldUnoptimizeImage(thumb)}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium">{service.name}</p>
                              <p className="max-w-[18rem] truncate text-xs text-muted-foreground">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {service.category?.name ?? "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(service.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="px-4 pb-4">
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </>
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
