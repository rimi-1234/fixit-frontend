"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";

import { CategoryFormDialog } from "@/app/(dashboardGroup)/dashboard/admin/categories/_components/category-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminCategories,
  useAdminDeleteCategory,
} from "@/hooks/use-admin";
import type { Category } from "@/lib/types";

export function AdminCategoriesManager() {
  const { data, isLoading, isError, refetch } = useAdminCategories();
  const deleteCategory = useAdminDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = data ?? [];

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setPendingId(deleteTarget.id);
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast in mutation
    } finally {
      setDeleting(false);
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={`Delete “${deleteTarget?.name ?? "category"}”?`}
        description="Services using it may become uncategorized or fail validation."
        confirmLabel="Delete category"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the catalog types technicians attach services to.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/admin" />}
          >
            Overview
          </Button>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden="true" />
            Add category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load categories"
          description="Check that you're signed in as admin and the API is running."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create the first category so technicians can list services."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus aria-hidden="true" />
              Add category
            </Button>
          }
        />
      ) : (
        <>
          <ul className="divide-y divide-border/60 lg:hidden">
            {categories.map((category) => {
              const busy = pendingId === category.id;
              return (
                <li
                  key={category.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium tracking-tight">{category.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {category.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(category)}
                    >
                      <Pencil aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={busy}
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const busy = pendingId === category.id;
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            onClick={() => setDeleteTarget(category)}
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
          </div>
        </>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        category={editing}
      />
    </div>
  );
}
