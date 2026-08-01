const STEPS = [
  {
    number: "01",
    title: "Choose a service",
    description: "Browse categories and find a technician that fits your home and schedule.",
  },
  {
    number: "02",
    title: "Request a time slot",
    description: "Send a booking request. The technician accepts before payment starts.",
  },
  {
    number: "03",
    title: "Pay and track",
    description: "Pay securely online, follow job status, and leave a review when it's done.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border/60 bg-muted/25">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12 max-w-lg space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            A clear path from request to completed job — no guesswork.
          </p>
        </div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map((step) => (
            <li key={step.number} className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground">
                {step.number}
              </p>
              <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
