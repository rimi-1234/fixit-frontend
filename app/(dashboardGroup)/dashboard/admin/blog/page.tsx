"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { formatDateTime } from "@/utils/format-date";
import { usePagination } from "@/hooks/use-pagination";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; email: string; name: string | null };
}

interface BlogResponse { posts: BlogPost[]; total: number }

const schema = z.object({
  title: z.string().min(4),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  imageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminBlogPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<BlogResponse>({
    queryKey: ["admin", "blog-posts"],
    queryFn: () => apiFetch<BlogResponse>("/blog?published=all"),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { published: true },
  });

  const createPost = useMutation({
    mutationFn: (data: FormValues) => apiFetch("/blog", { method: "POST", body: data }),
    onSuccess: () => {
      toast.success("Post created.");
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
    onError: () => toast.error("Failed to create post."),
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => apiFetch(`/blog/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Post deleted."); queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] }); },
    onError: () => toast.error("Failed to delete post."),
  });

  const posts = (data?.posts ?? []).filter((post) => {
    if (status === "published" && !post.published) return false;
    if (status === "draft" && post.published) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [post.title, post.excerpt, post.author?.email, post.author?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const { page, setPage, totalPages, paged } = usePagination(posts, 8);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} posts total</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-1.5">
          <Plus aria-hidden="true" className="size-4" />
          New post
        </Button>
      </div>

      <FilterBar>
        <FilterSearch
          id="blog-search"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Title, excerpt, author…"
        />
        <FilterSelect
          id="blog-status"
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All posts" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
        />
      </FilterBar>

      {showForm && (
        <form onSubmit={handleSubmit((d) => createPost.mutateAsync(d))} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-semibold">Create new post</h2>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input id="excerpt" {...register("excerpt")} aria-invalid={!!errors.excerpt} />
            {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <textarea id="content" rows={5} {...register("content")} aria-invalid={!!errors.content} className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50" />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input id="imageUrl" type="url" {...register("imageUrl")} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" {...register("published")} className="rounded" />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create post"}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState icon={Newspaper} title="Couldn't load posts" description="API error." action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>} />
      ) : posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No matching posts" description="Try another search or status filter." />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    {post.published ? (
                      <span className="text-green-600">Published</span>
                    ) : (
                      <span className="text-amber-600">Draft</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePost.mutate(post.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
