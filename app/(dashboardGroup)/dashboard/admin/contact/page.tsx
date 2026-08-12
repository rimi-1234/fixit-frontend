"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { formatDateTime } from "@/utils/format-date";
import { usePagination } from "@/hooks/use-pagination";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessagesResponse {
  messages: ContactMessage[];
  total: number;
}

export default function AdminContactPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<MessagesResponse>({
    queryKey: ["admin", "contact-messages", filter],
    queryFn: () => apiFetch<MessagesResponse>(`/contact?${filter === "unread" ? "read=false" : ""}`),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/contact/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] }),
  });

  const messages = data?.messages ?? [];
  const { page, setPage, totalPages, paged } = usePagination(messages, 8);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} messages received</p>
        </div>
        <div className="flex rounded-lg border border-border/60 overflow-hidden">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState icon={Mail} title="Couldn't load messages" description="API error." action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>} />
      ) : messages.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="No contact messages yet." />
      ) : (
        <div className="space-y-3">
          {paged.map((m) => (
            <div key={m.id} className={`rounded-2xl border p-5 shadow-sm ${m.read ? "border-border/60 bg-card" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name} <span className="text-xs font-normal text-muted-foreground">— {m.email}</span></p>
                  <p className="mt-0.5 text-sm font-medium">{m.subject}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                  {!m.read && (
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-xs" onClick={() => markRead.mutate(m.id)}>
                      <CheckCircle aria-hidden="true" className="size-3" /> Mark read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && !isError && messages.length > 0 ? (
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
