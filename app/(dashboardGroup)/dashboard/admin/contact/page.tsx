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
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<MessagesResponse>({
    queryKey: ["admin", "contact-messages", filter],
    queryFn: () => apiFetch<MessagesResponse>(`/contact?${filter === "unread" ? "read=false" : ""}`),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/contact/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] }),
  });

  const messages = (data?.messages ?? []).filter((m) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [m.name, m.email, m.subject, m.message]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const { page, setPage, totalPages, paged } = usePagination(messages, 8);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} messages received</p>
      </div>
      <FilterBar>
          <FilterSearch
            id="contact-search"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Name, email, subject…"
          />
          <FilterSelect
            id="contact-filter"
            label="Status"
            value={filter}
            onChange={(value) => {
              setFilter(value as "all" | "unread");
              setPage(1);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ]}
          />
        </FilterBar>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState icon={Mail} title="Couldn't load messages" description="API error." action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>} />
      ) : messages.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="No contact messages yet." />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((m) => (
                <TableRow key={m.id} className={m.read ? "" : "bg-primary/5"}>
                  <TableCell>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell className="font-medium">{m.subject}</TableCell>
                  <TableCell className="max-w-[18rem] truncate text-muted-foreground">
                    {m.message}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(m.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!m.read ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full text-xs"
                        onClick={() => markRead.mutate(m.id)}
                      >
                        <CheckCircle aria-hidden="true" className="size-3" /> Mark read
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Read</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {!isLoading && !isError && messages.length > 0 ? (
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
