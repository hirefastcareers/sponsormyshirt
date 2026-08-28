"use client";

/**
 * Content Policy notice (checkout) and footer trigger + modal.
 */
import { useEffect, useId, useState } from "react";
import {
  CONTENT_POLICY_AGREEMENT,
  CONTENT_POLICY_FOOTER_LABEL,
  CONTENT_POLICY_MODAL_BODY,
  CONTENT_POLICY_MODAL_TITLE,
} from "@/lib/content-policy";

export function ContentPolicyNotice({
  className = "text-center text-[11px] leading-relaxed text-slate-400",
}: {
  className?: string;
}) {
  return <p className={className}>{CONTENT_POLICY_AGREEMENT}</p>;
}

export function ContentPolicyFooterLine({
  className = "text-xs leading-relaxed text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {CONTENT_POLICY_FOOTER_LABEL}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close content policy"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:mx-4 sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h2
                id={titleId}
                className="text-lg font-medium tracking-tight text-zinc-900"
              >
                {CONTENT_POLICY_MODAL_TITLE}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close"
              >
                Esc
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600">
              {CONTENT_POLICY_MODAL_BODY.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-zinc-500">
              {CONTENT_POLICY_AGREEMENT}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
