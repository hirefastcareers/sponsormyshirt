"use client";

/**
 * Streamlined £5 micro-sponsor checkout modal.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ContentPolicyNotice } from "@/components/ContentPolicy";
import { MICRO_SPONSOR_PRICE_GBP } from "@/lib/micro-sponsors";

interface MicroSponsorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MicroSponsorModal({
  open,
  onClose,
}: MicroSponsorModalProps) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSponsorName("");
    setSponsorUrl("");
    setFile(null);
    setError(null);
    setSubmitting(false);
    if (fileRef.current) fileRef.current.value = "";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach your logo file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let uploadJson: { path?: string; error?: string } = {};
      try {
        uploadJson = (await uploadRes.json()) as {
          path?: string;
          error?: string;
        };
      } catch {
        throw new Error(
          uploadRes.ok
            ? "Logo upload returned an invalid response"
            : `Logo upload failed (HTTP ${uploadRes.status})`,
        );
      }

      if (!uploadRes.ok) {
        throw new Error(uploadJson.error ?? "Logo upload failed");
      }

      if (!uploadJson.path) {
        throw new Error("Logo upload succeeded but no storage path was returned");
      }

      const checkoutRes = await fetch("/api/checkout/micro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorName: sponsorName.trim(),
          sponsorUrl: sponsorUrl.trim(),
          logoPath: uploadJson.path,
        }),
      });

      let checkoutJson: { checkout_url?: string; error?: string } = {};
      try {
        checkoutJson = (await checkoutRes.json()) as typeof checkoutJson;
      } catch {
        throw new Error(
          checkoutRes.ok
            ? "Checkout returned an invalid response"
            : `Checkout failed (HTTP ${checkoutRes.status})`,
        );
      }

      if (!checkoutRes.ok) {
        throw new Error(checkoutJson.error ?? "Checkout failed");
      }

      const checkoutUrl = checkoutJson.checkout_url;
      if (!checkoutUrl) {
        throw new Error("No checkout_url returned");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:mx-4 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Micro-Sponsor Wall
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900"
            >
              Sponsor for £{MICRO_SPONSOR_PRICE_GBP}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your logo on the site sidebar &amp; mobile marquee — instant after
              payment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            Esc
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Sponsor Name
            </span>
            <input
              required
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="Your brand or name"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Target Link URL
            </span>
            <input
              required
              type="url"
              value={sponsorUrl}
              onChange={(e) => setSponsorUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Logo (PNG / SVG / WebP)
            </span>
            <input
              ref={fileRef}
              required
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
              ? "Redirecting to payment…"
              : `Pay £${MICRO_SPONSOR_PRICE_GBP} via Dodo`}
          </button>

          <ContentPolicyNotice />

          <p className="text-center text-[11px] text-slate-400">
            Secure checkout via Dodo Payments · Merchant of Record
          </p>
        </form>
      </div>
    </div>
  );
}
