import {
  CHARITY_DONATION_RATE,
  CHARITY_NAME,
  formatGbp,
  totalCharityRaisedFromSoldSlots,
} from "@/lib/charity";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface CharityTransparencyProps {
  slots: SponsorshipSlot[];
}

export default function CharityTransparency({
  slots,
}: CharityTransparencyProps) {
  const charityRaised = totalCharityRaisedFromSoldSlots(slots);
  const pledgePercent = Math.round(CHARITY_DONATION_RATE * 100);
  const soldCount = slots.filter((s) => s.status === "sold").length;

  return (
    <div className="border-t border-zinc-800 pt-6">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        Charity transparency
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        <span className="font-semibold text-sky-400">
          {formatGbp(charityRaised)}
        </span>{" "}
        in funds raised for {CHARITY_NAME} so far — {pledgePercent}% of{" "}
        {soldCount === 1 ? "1 confirmed sale" : `${soldCount} confirmed sales`}
        .
      </p>
    </div>
  );
}
