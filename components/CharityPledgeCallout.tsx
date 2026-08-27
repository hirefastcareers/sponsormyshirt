import {
  CHARITY_DONATION_RATE,
  CHARITY_NAME,
  CHARITY_SPLIT_NOTE,
} from "@/lib/charity";

export default function CharityPledgeCallout() {
  const pledgePercent = Math.round(CHARITY_DONATION_RATE * 100);

  return (
    <div className="mt-4 max-w-2xl">
      <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900">
        {pledgePercent}% of all sponsorship proceeds donated to {CHARITY_NAME}{" "}
        <span aria-hidden>💙</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        {CHARITY_SPLIT_NOTE}
      </p>
    </div>
  );
}
