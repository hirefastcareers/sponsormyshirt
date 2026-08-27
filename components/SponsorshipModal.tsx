"use client";

/**
 * Sponsorship checkout modal:
 * collect brand details → optional upsells → upload logo → create Dodo session.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  calculateOrderTotalGbp,
  DOFOLLOW_LINK_ADDON,
  SOCIAL_POST_ADDON,
} from "@/lib/addons";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface SponsorshipModalProps {
  slot: SponsorshipSlot | null;
  open: boolean;
  onClose: () => void;
  onCheckoutError?: () => void;
}

export default function SponsorshipModal({
  slot,
  open,
  onClose,
  onCheckoutError,
}: SponsorshipModalProps) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hasSocialPost, setHasSocialPost] = useState(false);
  const [hasDofollowLink, setHasDofollowLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSponsorName("");
    setSponsorUrl("");
    setFile(null);
    setHasSocialPost(false);
    setHasDofollowLink(false);
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

  const orderTotal = calculateOrderTotalGbp(slot.price_gbp, {
    hasSocialPost,
    hasDofollowLink,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slot || !file) {
      setError("Please attach your logo file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload via server route (service role) — never browser → Storage directly
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

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Permanent DB/config id (e.g. "shorts_left") — not the UI badge number
          slotId: slot.id,
          sponsorName: sponsorName.trim(),
          sponsorUrl: sponsorUrl.trim(),
          logoPath: uploadJson.path,
          hasSocialPost,
          hasDofollowLink,
        }),
      });

      let checkoutJson: {
        checkout_url?: string;
        error?: string;
        code?: string;
        redirect?: string;
      } = {};
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
        if (
          checkoutRes.status === 400 &&
          checkoutJson.code === "slot_taken"
        ) {
          window.location.href =
            (checkoutJson.redirect as string) ??
            `/?taken=${encodeURIComponent(slot.id)}`;
          return;
        }
        throw new Error(checkoutJson.error ?? "Checkout failed");
      }

      const checkoutUrl = checkoutJson.checkout_url;
      if (!checkoutUrl) {
        throw new Error("No checkout_url returned");
      }

      // Redirect only after checkout session is initialized server-side
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
      onCheckoutError?.();
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
              Claim placement
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900"
            >
              {slot.slot_name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              £{slot.price_gbp}{" "}
              <span className="font-normal text-slate-400">· one-time · GBP</span>
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
              Company / Sponsor Name
            </span>
            <input
              required
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="Acme Athletics"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Destination URL
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

          <fieldset className="space-y-2.5">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Boost Your Reach (Optional Add-ons)
            </legend>

            <AddonCheckbox
              checked={hasSocialPost}
              onChange={setHasSocialPost}
              title={SOCIAL_POST_ADDON.title}
              price={`+£${SOCIAL_POST_ADDON.price_gbp}`}
              subtitle={SOCIAL_POST_ADDON.subtitle}
            />
            <AddonCheckbox
              checked={hasDofollowLink}
              onChange={setHasDofollowLink}
              title={DOFOLLOW_LINK_ADDON.title}
              price={`+£${DOFOLLOW_LINK_ADDON.price_gbp}`}
              subtitle={DOFOLLOW_LINK_ADDON.subtitle}
            />
          </fieldset>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
              ? "Redirecting to payment…"
              : `Pay £${orderTotal} via Dodo`}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Secure checkout via Dodo Payments · Merchant of Record
          </p>
        </form>
      </div>
    </div>
  );
}

function AddonCheckbox({
  checked,
  onChange,
  title,
  price,
  subtitle,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  price: string;
  subtitle: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
        checked
          ? "border-emerald-300 bg-emerald-50/70"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-emerald-700">
            {price}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
          {subtitle}
        </span>
      </span>
    </label>
  );
}
