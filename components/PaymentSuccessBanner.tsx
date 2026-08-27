"use client";

/**
 * Thank-you banner after Dodo redirects back with ?payment=success&slot=
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { addonLabels } from "@/lib/addons";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface PaymentSuccessBannerProps {
  slot: SponsorshipSlot | null;
}

export default function PaymentSuccessBanner({
  slot,
}: PaymentSuccessBannerProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(!!slot);

  useEffect(() => {
    setVisible(!!slot);
  }, [slot]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    url.searchParams.delete("slot");
    const qs = url.searchParams.toString();
    router.replace(qs ? `${url.pathname}?${qs}` : url.pathname, {
      scroll: false,
    });
  }, [router]);

  if (!visible || !slot) return null;

  const addons = addonLabels(slot);
  const sponsor = slot.sponsor_name?.trim() || "your brand";

  return (
    <div role="status" className="border-b border-emerald-200 bg-emerald-50">
      <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-6 py-4 sm:items-center lg:px-12">
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-950">
            Payment received — thank you, {sponsor}.
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            <span className="font-medium">{slot.slot_name}</span> is locked in
            on the kit.
            {addons.length > 0 ? (
              <>
                {" "}
                Add-ons:{" "}
                <span className="font-medium">{addons.join(" · ")}</span>.
              </>
            ) : (
              " No optional add-ons were selected."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-900"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
