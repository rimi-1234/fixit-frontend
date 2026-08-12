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
import { formatDateTime } from "@/utils/format-date";

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

  const posts = data?.posts ?? [];

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
        <EmptyState icon={Newspaper} title="No posts yet" description="Create your first blog post above." />
      ) : (
        <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)} · {post.published ? <span className="text-green-600">Published</span> : <span className="text-amber-600">Draft</span>}</p>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0 text-destructive hover:text-destructive" onClick={() => deletePost.mutate(post.id)}>
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
