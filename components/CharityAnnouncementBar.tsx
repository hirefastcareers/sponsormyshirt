import {
  CHARITY_DONATION_RATE,
  CHARITY_NAME,
} from "@/lib/charity";

export default function CharityAnnouncementBar() {
  const pledgePercent = Math.round(CHARITY_DONATION_RATE * 100);

  return (
    <div
      className="border-b border-sky-100 bg-sky-50/90 px-4 py-2 text-sm text-center text-sky-900"
      role="status"
    >
      <p className="flex items-center justify-center gap-1.5 font-medium">
        {pledgePercent}% of all sponsorship proceeds donated to {CHARITY_NAME}{" "}
        <span aria-hidden>💙</span>
      </p>
    </div>
  );
}
