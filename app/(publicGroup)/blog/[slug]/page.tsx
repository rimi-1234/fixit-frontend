"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { displayNameFromEmail } from "@/utils/display-name";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  author: { id: string; email: string; name: string | null };
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () =>
      apiFetch<BlogPost>(`/api/blog/${slug}`, { skipAuth: true, sameOrigin: true }),
    enabled: Boolean(slug),
    retry: 0,
  });

  return (
    <main className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to blog
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="aspect-[16/9] rounded-2xl bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        ) : isError || !post ? (
          <p className="text-muted-foreground">This post could not be found.</p>
        ) : (
          <div className="space-y-6">
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                className="aspect-[16/9] w-full rounded-2xl object-cover"
              />
            ) : null}
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{post.author.name ?? displayNameFromEmail(post.author.email)}</span>
                {post.publishedAt ? (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3.5" />
                  {Math.max(1, Math.ceil(post.content.length / 800))} min read
                </span>
              </div>
            </div>
            <p className="text-base text-muted-foreground">{post.excerpt}</p>
            <div className="space-y-4 text-sm leading-relaxed text-foreground whitespace-pre-line">
              {post.content}
            </div>
          </div>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
