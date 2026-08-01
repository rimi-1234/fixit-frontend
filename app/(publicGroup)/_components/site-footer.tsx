import Link from "next/link";
import { Wrench } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <Wrench aria-hidden="true" className="size-4" />
            FixItNow
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Home services marketplace for customers and technicians.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Register
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/40">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} FixItNow
        </p>
      </div>
    </footer>
  );
}
