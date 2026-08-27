"use client";

/**
 * Sponsorship checkout modal:
 * collect brand details → upload logo to Supabase Storage → create Dodo session.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface SponsorshipModalProps {
  slot: SponsorshipSlot | null;
  open: boolean;
  onClose: () => void;
}

export default function SponsorshipModal({
  slot,
  open,
  onClose,
}: SponsorshipModalProps) {
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
  }, [open, onClose, slot?.id]);

  if (!open || !slot) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slot || !file) {
      setError("Please attach your logo file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1) Upload logo → sponsor-logos bucket
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadJson.error ?? "Logo upload failed");
      }

      // 2) Create Dodo checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          sponsorName: sponsorName.trim(),
          sponsorUrl: sponsorUrl.trim(),
          logoPath: uploadJson.path as string,
        }),
      });
      const checkoutJson = await checkoutRes.json();

      if (!checkoutRes.ok) {
        throw new Error(checkoutJson.error ?? "Checkout failed");
      }

      if (!checkoutJson.checkout_url) {
        throw new Error("No checkout_url returned");
      }

      // 3) Redirect to Dodo-hosted checkout
      window.location.href = checkoutJson.checkout_url as string;
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md border border-emerald-500/30 bg-slate-900 shadow-[0_0_60px_rgba(16,185,129,0.12)] sm:mx-4">
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
              Claim Placement
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-xl tracking-tight text-slate-50"
            >
              {slot.slot_name}
            </h2>
            <p className="mt-1 font-mono text-sm text-emerald-400">
              £{slot.price_gbp}{" "}
              <span className="text-slate-500">· one-time · GBP</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-slate-500 transition hover:text-slate-200"
            aria-label="Close"
          >
            ESC
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Company / Sponsor Name
            </span>
            <input
              required
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="Acme Athletics"
              className="w-full border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Destination URL
            </span>
            <input
              required
              type="url"
              value={sponsorUrl}
              onChange={(e) => setSponsorUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Logo (PNG / SVG / WebP)
            </span>
            <input
              ref={fileRef}
              required
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full border border-dashed border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:border-0 file:bg-emerald-500/15 file:px-3 file:py-1 file:font-mono file:text-xs file:text-emerald-400"
            />
          </label>

          {error && (
            <p className="border border-red-500/30 bg-red-950/40 px-3 py-2 font-mono text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden border border-emerald-400/60 bg-emerald-500/10 px-4 py-3 font-mono text-sm uppercase tracking-[0.15em] text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-10">
              {submitting ? "Redirecting to payment…" : "Proceed to Payment"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent transition duration-700 group-hover:translate-x-full" />
          </button>

          <p className="text-center font-mono text-[10px] text-slate-500">
            Secure checkout via Dodo Payments · Merchant of Record
          </p>
        </form>
      </div>
    </div>
  );
}
