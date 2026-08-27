"use client";

/**
 * Single micro-sponsor logo tile with optional link.
 */
import { normalizeSponsorUrl } from "@/lib/sponsor-display";
import type { MicroSponsor } from "@/types/micro-sponsor";

interface MicroSponsorLogoProps {
  sponsor: MicroSponsor;
  size?: "sm" | "md";
}

export default function MicroSponsorLogo({
  sponsor,
  size = "md",
}: MicroSponsorLogoProps) {
  const href = normalizeSponsorUrl(sponsor.link_url);
  const sizeClass =
    size === "sm" ? "h-10 w-10" : "h-12 w-12 xl:h-14 xl:w-14";

  const inner = (
    // eslint-disable-next-line @next/next/no-img-element -- sponsor-uploaded logos
    <img
      src={sponsor.logo_url}
      alt={sponsor.name}
      title={sponsor.name}
      className={`${sizeClass} rounded-lg border border-zinc-200/80 bg-white object-contain p-1 shadow-sm transition hover:border-emerald-300 hover:shadow-md`}
    />
  );

  if (!href) {
    return <div className="shrink-0">{inner}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="shrink-0"
      title={sponsor.name}
    >
      {inner}
    </a>
  );
}
