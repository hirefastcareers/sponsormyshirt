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
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M16.2 3.5 13.5 2a3.2 3.2 0 0 1-3 0L7.8 3.5A1.6 1.6 0 0 0 6.7 5.3l.5 2.8A.8.8 0 0 0 8 8.7h1.7V17a1.6 1.6 0 0 0 1.6 1.6h2.4A1.6 1.6 0 0 0 15.3 17V8.7H17a.8.8 0 0 0 .8-.6l.5-2.8a1.6 1.6 0 0 0-1.1-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          light
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-900"
        }`}
      >
        <ShirtIcon className="h-4 w-4" />
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
