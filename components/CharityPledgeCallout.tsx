import { CHARITY_NAME, CHARITY_URL } from "@/lib/charity";

export default function CharityPledgeCallout() {
  return (
    <p
      className="inline-flex flex-wrap items-center justify-center gap-x-1 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1.5 text-xs font-medium leading-snug text-sky-900"
    >
      <span aria-hidden>💙</span>
      <span>25% of proceeds donated to </span>
      <a
        href={CHARITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition hover:text-sky-700"
      >
        {CHARITY_NAME}
      </a>
      <span> (rest covers kit printing, entry, and indie projects)</span>
    </p>
  );
}
