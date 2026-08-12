"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";

import { apiFetch } from "@/lib/api-client";
import { SiteFooter } from "@/app/(publicGroup)/_components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});
type FormValues = z.infer<typeof schema>;

const INFO_CARDS = [
  { icon: Mail, label: "Email", value: "support@fixitnow.com", href: "mailto:support@fixitnow.com" },
  { icon: Phone, label: "Phone", value: "+1 (800) 555-5555", href: "tel:+18005555555" },
  { icon: MapPin, label: "Office", value: "123 Service Lane, New York, NY 10001", href: "#" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    try {
      await apiFetch("/contact", { method: "POST", body: data, skipAuth: true });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      reset();
      setSubmitted(true);
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

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
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Contact</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Get in touch</h1>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              Have a question or need help? Our team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info cards + form */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Left – info */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Contact information</h2>
            {INFO_CARDS.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-sm font-medium">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Right – form */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-12 text-center"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                  <Mail aria-hidden="true" className="size-7" />
                </span>
                <h3 className="text-lg font-semibold">Message sent!</h3>
                <p className="text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                <Button variant="outline" className="mt-2" onClick={() => setSubmitted(false)}>
                  Send another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <h2 className="text-lg font-semibold">Send a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" {...register("name")} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" {...register("subject")} aria-invalid={!!errors.subject} />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us more..."
                    {...register("message")}
                    aria-invalid={!!errors.message}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50 aria-[invalid=true]:border-destructive"
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
