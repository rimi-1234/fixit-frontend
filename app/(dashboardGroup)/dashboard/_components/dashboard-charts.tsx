"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#ec4899"];

export function last7DaysCounts(items: Array<{ createdAt?: string; scheduledTime?: string }>) {
  const now = Date.now();
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(now - (6 - i) * 86400000);
    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    const count = items.filter((item) => {
      const raw = item.createdAt || item.scheduledTime;
      if (!raw) return false;
      return new Date(raw).toDateString() === day.toDateString();
    }).length;
    return { day: label, value: count };
  });
}

export function last7DaysSums(
  items: Array<{ createdAt?: string; paidAt?: string | null; amount?: number; status?: string }>
) {
  const now = Date.now();
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(now - (6 - i) * 86400000);
    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    const value = items
      .filter((item) => {
        if (item.status && item.status !== "COMPLETED") return false;
        const raw = item.paidAt || item.createdAt;
        if (!raw) return false;
        return new Date(raw).toDateString() === day.toDateString();
      })
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    return { day: label, value };
  });
}

export function statusBreakdown(items: Array<{ status: string }>) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function WeeklyBarChart({
  data,
  label = "Count",
}: {
  data: Array<{ day: string; value: number }>;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(value) => [value, label]} />
        <Bar dataKey="value" name={label} fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  label = "Amount",
}: {
  data: Array<{ day: string; value: number }>;
  label?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(value) => [value, label]} />
        <Line
          type="monotone"
          dataKey="value"
          name={label}
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={72}
          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
          fontSize={10}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}
