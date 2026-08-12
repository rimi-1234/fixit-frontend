"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { CalendarDays, Clock, Newspaper } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { PaginationBar } from "@/components/pagination-bar";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { displayNameFromEmail } from "@/utils/display-name";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: string | null;
  author: { id: string; email: string; name: string | null };
}

interface BlogResponse {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  page: number;
}

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", page],
    queryFn: () =>
      apiFetch<BlogResponse>(`/api/blog?page=${page}&limit=9`, {
        skipAuth: true,
        sameOrigin: true,
      }),
    retry: 0,
  });

  const posts = data?.posts ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-border/50 bg-muted/25 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-3 text-center"
          >
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Blog</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Home service tips & guides</h1>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              Expert advice to help you maintain, repair, and improve your home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3 rounded-2xl bg-muted p-4">
                <div className="aspect-[16/10] w-full rounded-xl bg-muted-foreground/20" />
                <div className="h-5 w-3/4 rounded bg-muted-foreground/20" />
                <div className="h-4 w-full rounded bg-muted-foreground/10" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Newspaper aria-hidden="true" className="size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const authorName = post.author.name ?? displayNameFromEmail(post.author.email);
              const readingTime = Math.max(1, Math.ceil(post.excerpt.length / 800));
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {post.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
                      {post.title}
                    </h2>
                    <p className="flex-1 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : "Draft"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock aria-hidden="true" className="size-3.5" />
                        {readingTime} min read
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 self-start mt-1"
                    >
                      Read more
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
        {!isLoading && posts.length > 0 ? (
          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </section>

      <SiteFooter />
    </main>
  );
}
