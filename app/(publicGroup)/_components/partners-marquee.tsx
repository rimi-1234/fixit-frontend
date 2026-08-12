"use client";

import Image from "next/image";

/**
 * Drop PNG logos into `/public/partners/` and set `src` to those files.
 * Example: { name: "Acme", src: "/partners/acme.png" }
 */
export const PARTNER_LOGOS = [
  { name: "HomeGuard", src: "/partners/homeguard.png" },
  { name: "PipeWise", src: "/partners/pipewise.png" },
  { name: "BrightVolt", src: "/partners/brightvolt.png" },
  { name: "CleanCraft", src: "/partners/cleancraft.png" },
  { name: "ToolNest", src: "/partners/toolnest.png" },
  { name: "FixFleet", src: "/partners/fixfleet.png" },
  { name: "ServiceLab", src: "/partners/servicelab.png" },
  { name: "AetherAir", src: "/partners/aetherair.png" },
] as const;

function PartnerTrack({
  suffix,
  ariaHidden = false,
}: {
  suffix: string;
  ariaHidden?: boolean;
}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14 md:gap-16 md:pr-16"
      aria-hidden={ariaHidden || undefined}
    >
      {PARTNER_LOGOS.map((logo) => (
        <li
          key={`${logo.name}-${suffix}`}
          className="relative flex h-8 w-28 shrink-0 items-center justify-center sm:h-9 sm:w-32 md:h-10 md:w-36"
        >
          <Image
            src={logo.src}
            alt={ariaHidden ? "" : logo.name}
            width={160}
            height={48}
            className="h-full w-auto max-w-full object-contain opacity-70 transition-opacity duration-300 hover:opacity-100 dark:opacity-80 dark:hover:opacity-100"
            unoptimized
          />
        </li>
      ))}
    </ul>
  );
}

export function PartnersMarquee() {
  return (
    <section
      aria-label="Partner logos"
      className="relative overflow-hidden py-8 sm:py-10 md:py-12"
    >
      {/* Left / right opacity blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-[linear-gradient(to_right,var(--background)_0%,color-mix(in_oklch,var(--background)_75%,transparent)_45%,transparent_100%)] sm:w-28 md:w-40 lg:w-52"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-[linear-gradient(to_left,var(--background)_0%,color-mix(in_oklch,var(--background)_75%,transparent)_45%,transparent_100%)] sm:w-28 md:w-40 lg:w-52"
      />

      <div className="relative flex overflow-hidden">
        <div className="partners-marquee flex w-max">
          <PartnerTrack suffix="a" />
          <PartnerTrack suffix="b" ariaHidden />
        </div>
      </div>
    </section>
  );
}
