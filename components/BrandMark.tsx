/**
 * Shared SponsorMyShirt brand lockup for header + footer.
 */

interface BrandMarkProps {
  /** Light surfaces (header) or dark (footer). */
  variant?: "light" | "dark";
  /** Show the GNR '26 live pill (desktop only). */
  showStatus?: boolean;
  href?: string;
  className?: string;
}

function ShirtIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

export default function BrandMark({
  variant = "light",
  showStatus = false,
  href = "#",
  className = "",
}: BrandMarkProps) {
  const light = variant === "light";

  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="sponsormyshirt.app"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0 ${
          light
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-900"
        }`}
      >
        <ShirtIcon className="h-5 w-5" />
      </span>

      <span className="flex min-w-0 items-baseline gap-0">
        <span
          className={`text-[15px] font-semibold tracking-tight sm:text-[17px] ${
            light ? "text-zinc-900" : "text-zinc-100"
          }`}
        >
          sponsormyshirt
        </span>
        <span
          className={`text-[15px] font-normal sm:text-[17px] ${
            light ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          .app
        </span>
      </span>

      {showStatus ? (
        <span
          className={`ml-1 hidden items-center gap-1.5 rounded-full border px-2 py-0.5 md:inline-flex ${
            light
              ? "border-zinc-200 bg-zinc-50"
              : "border-zinc-700 bg-zinc-800/80"
          }`}
        >
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
            aria-hidden
          />
          <span
            className={`font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
              light ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            GNR &apos;26
          </span>
        </span>
      ) : null}
    </a>
  );
}
