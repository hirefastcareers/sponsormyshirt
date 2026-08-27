/**
 * Sticky top navigation with smooth-scroll section links and claim CTA.
 */
import BrandMark from "@/components/BrandMark";

const NAV_LINKS = [
  { href: "#positions", label: "Positions" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#the-race", label: "The Race" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E4E4E7] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3.5 lg:px-12">
        <BrandMark showStatus href="#" />

        <nav
          aria-label="Page sections"
          className="flex items-center gap-1 sm:gap-2 lg:gap-5"
        >
          <ul className="hidden items-center gap-1 md:flex lg:gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 lg:px-3"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#kit-viewer"
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 sm:text-[13px]"
          >
            Claim a Slot
          </a>
        </nav>
      </div>
    </header>
  );
}
