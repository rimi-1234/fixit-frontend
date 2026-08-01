import type { Metadata } from "next";

import { RegisterForm } from "@/app/(authGroup)/_components/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Book trusted technicians or offer your services on FixItNow.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
