import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full min-w-0 flex-1 overflow-x-hidden bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
