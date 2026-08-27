/**
 * Sticky top navigation with smooth-scroll section links and claim CTA.
 */
import BrandMark from "@/components/BrandMark";
import CharityAnnouncementBar from "@/components/CharityAnnouncementBar";

const NAV_LINKS = [
  { href: "#positions", label: "Positions" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#the-race", label: "The Race" },
  { href: "#faq", label: "FAQ" },
] as const;

const PROPRINT_URL = "https://www.proprintuk.com/";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <a
        href={PROPRINT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Official kit printing partner — Visit ProPrint (opens in a new tab)"
        className="flex w-full items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-center text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="shrink-0">Official Kit Printing Partner</span>
          <span className="inline-flex shrink-0 items-center rounded bg-white px-1.5 py-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- static partner logo */}
            <img
              src="/proprint-logo.jpg"
              alt="ProPrint"
              className="h-5 w-auto max-w-[7.5rem] object-contain"
            />
          </span>
          <span className="hidden shrink-0 sm:inline">Visit ProPrint →</span>
        </span>
      </a>

      <div className="border-b border-[#E4E4E7] bg-white/90 backdrop-blur-md">
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
      </div>

      <CharityAnnouncementBar />
    </header>
  );
}
