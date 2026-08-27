"use client";

/**
 * Friendly notice when checkout bounced a sold slot back via ?taken=
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TakenBannerProps {
  taken: string | null;
}

export default function TakenBanner({ taken }: TakenBannerProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(!!taken);

  useEffect(() => {
    setVisible(!!taken);
  }, [taken]);

  const dismiss = useCallback(() => {
    setVisible(false);
    // Drop ?taken= from the URL without a full reload
    const url = new URL(window.location.href);
    url.searchParams.delete("taken");
    const qs = url.searchParams.toString();
    router.replace(qs ? `${url.pathname}?${qs}` : url.pathname, {
      scroll: false,
    });
  }, [router]);

  if (!visible || !taken) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-5 py-3 sm:items-center sm:px-8">
        <p className="flex-1 text-sm font-medium text-amber-900">
          Sorry! Someone just claimed that slot a moment ago. Please select an
          available position.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 hover:text-amber-900"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
