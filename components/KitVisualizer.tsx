"use client";

/**
 * Kit blueprint: plain t-shirt / shorts / cap / socks silhouettes
 * with numbered circular placement nodes.
 */
import type { CSSProperties, ReactNode } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";
import {
  hasAnySoldPosition,
  isPositionActive,
  isTitleTakeoverPurchasable,
  TITLE_TAKEOVER,
  TITLE_TAKEOVER_ID,
} from "@/lib/positions";
import {
  normalizeSponsorUrl,
  resolveSponsorLogoUrl,
} from "@/lib/sponsor-display";
import { MARKER_POS, getActiveDisplayNums, type ZoneId } from "@/lib/zones";

const FILL = "#EFEFEA";
const STROKE = "#D4D4D8";
const ZONE = "#A1A1AA";
const SELECTED = "#059669";
const SOLD = "#3F3F46";
const INK = "#18181B";

interface KitVisualizerProps {
  slots: SponsorshipSlot[];
  selectedIds: Set<string>;
  hoveredId: string | null;
  onToggle: (slot: SponsorshipSlot) => void;
  onHover: (id: string | null) => void;
}

export default function KitVisualizer({
  slots,
  selectedIds,
  hoveredId,
  onToggle,
  onHover,
}: KitVisualizerProps) {
  const byId = new Map(slots.map((s) => [s.id, s]));
  const titleSlot =
    byId.get(TITLE_TAKEOVER_ID) ??
    ({
      id: TITLE_TAKEOVER.id,
      slot_name: TITLE_TAKEOVER.slot_name,
      category: TITLE_TAKEOVER.category,
      price_gbp: TITLE_TAKEOVER.price_gbp,
      status: "available",
      sponsor_name: null,
      sponsor_url: null,
      sponsor_logo_url: null,
      x_position: 50,
      y_position: 50,
      dodo_product_id: null,
    } satisfies SponsorshipSlot);

  const takeoverOpen = isTitleTakeoverPurchasable(slots);
  const anySold = hasAnySoldPosition(slots);
  const titleSelected = selectedIds.has(TITLE_TAKEOVER_ID);
  const titleDisabled = !takeoverOpen || titleSlot.status !== "available";
  const displayNums = getActiveDisplayNums();

  function node(id: ZoneId) {
    if (!isPositionActive(id)) return null;
    const slot = byId.get(id);
    const displayNum = displayNums[id];
    const pos = MARKER_POS[id];
    if (!slot || !displayNum || !pos) return null;

    const isSelected = selectedIds.has(id);
    const isHovered = hoveredId === id;
    const isSold = slot.status === "sold";
    const isPending = slot.status === "pending";
    const available = slot.status === "available";
    const logoUrl = resolveSponsorLogoUrl(slot.sponsor_logo_url);
    const sponsorHref = normalizeSponsorUrl(slot.sponsor_url);
    const showLogo = Boolean(logoUrl) && (isSold || isPending);

    let bg = "#FFFFFF";
    let border = INK;
    let color = INK;

    if (showLogo) {
      bg = "#FFFFFF";
      border = isSold ? SOLD : "#D97706";
      color = INK;
    } else if (isSold) {
      bg = SOLD;
      border = SOLD;
      color = "#FFFFFF";
    } else if (isPending) {
      bg = "#FEF3C7";
      border = "#D97706";
      color = "#92400E";
    } else if (isSelected) {
      bg = SELECTED;
      border = SELECTED;
      color = "#FFFFFF";
    }

    const size = showLogo || isSold ? Math.max(pos.size, 52) : pos.size;
    const shellStyle: CSSProperties = {
      left: pos.left,
      top: pos.top,
      width: showLogo ? size : isSold ? size + 14 : size,
      height: size,
      background: bg,
      borderColor: border,
      color,
      boxShadow: isHovered
        ? isSelected
          ? "0 0 0 6px rgba(5,150,105,0.28)"
          : "0 0 0 6px rgba(5,150,105,0.18)"
        : isSelected
          ? "0 0 0 3px rgba(5,150,105,0.22)"
          : undefined,
      zIndex: isHovered || isSelected ? 20 : 10,
      transform: `translate(-50%, -50%) scale(${isHovered ? 1.06 : 1})`,
    };

    const title =
      showLogo && slot.sponsor_name
        ? `${slot.slot_name} — ${slot.sponsor_name}`
        : isSold
          ? `${slot.slot_name} — Sold`
          : isPending
            ? `${slot.slot_name} — Pending`
            : `${slot.slot_name} — £${slot.price_gbp}`;

    if (showLogo && logoUrl) {
      const logo = (
        // eslint-disable-next-line @next/next/no-img-element -- external sponsor logos from Supabase Storage
        <img
          src={logoUrl}
          alt={slot.sponsor_name ?? `${slot.slot_name} sponsor`}
          className="box-border h-full w-full rounded-full object-contain p-[12%]"
          draggable={false}
        />
      );

      const shellClass =
        "absolute block overflow-hidden rounded-full border-2 transition-all duration-150";

      if (sponsorHref) {
        return (
          <a
            key={id}
            href={sponsorHref}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            aria-label={`${displayNum} ${slot.slot_name} — ${slot.sponsor_name ?? "sponsor"}`}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            className={`${shellClass} cursor-pointer`}
            style={shellStyle}
          >
            {logo}
          </a>
        );
      }

      return (
        <div
          key={id}
          title={title}
          aria-label={`${displayNum} ${slot.slot_name}`}
          onMouseEnter={() => onHover(id)}
          onMouseLeave={() => onHover(null)}
          className={shellClass}
          style={shellStyle}
        >
          {logo}
        </div>
      );
    }

    return (
      <button
        key={id}
        type="button"
        disabled={!available}
        title={title}
        aria-pressed={isSelected}
        aria-label={`${displayNum} ${slot.slot_name}`}
        onClick={() => available && onToggle(slot)}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        className="absolute flex items-center justify-center rounded-full border-2 font-mono text-xs font-medium transition-all duration-150"
        style={{
          ...shellStyle,
          cursor: available ? "pointer" : "not-allowed",
        }}
      >
        {isSold ? (
          <span className="px-0.5 text-[10px] font-semibold tracking-wide">
            SOLD
          </span>
        ) : (
          displayNum
        )}
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E4E4E7] bg-white p-5 sm:p-7">
      <div className="mb-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Race-day kit
        </p>
        <h2 className="mt-1 text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
          Pick your placement.
        </h2>
      </div>

      {/* Title Sponsor / Whole Shirt — only when every position is open */}
      <div className="mb-5">
        <button
          type="button"
          disabled={titleDisabled}
          aria-pressed={titleSelected}
          aria-label="Title Sponsor / Whole Shirt takeover"
          title={
            titleDisabled
              ? anySold || titleSlot.status === "sold"
                ? "Title Sponsor unavailable — a placement has already been sold"
                : "Title Sponsor unavailable — every position must still be open"
              : `${titleSlot.slot_name} — £${titleSlot.price_gbp}`
          }
          onClick={() => !titleDisabled && onToggle(titleSlot)}
          onMouseEnter={() => onHover(TITLE_TAKEOVER_ID)}
          onMouseLeave={() => onHover(null)}
          className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
            titleDisabled
              ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60"
              : titleSelected
                ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                : hoveredId === TITLE_TAKEOVER_ID
                  ? "border-zinc-300 bg-zinc-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              Master package
            </p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900">
              Title Sponsor / Whole Shirt
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {titleDisabled
                ? "Unavailable — every kit position must still be open"
                : "Claim every placement in one purchase"}
            </p>
          </div>
          <span
            className={`shrink-0 font-mono text-sm tabular-nums ${
              titleDisabled
                ? "text-zinc-400"
                : titleSelected
                  ? "font-medium text-emerald-700"
                  : "font-medium text-zinc-900"
            }`}
          >
            {titleSlot.status === "sold"
              ? "Sold"
              : titleDisabled
                ? "Locked"
                : `£${titleSlot.price_gbp.toLocaleString("en-GB")}`}
          </span>
        </button>
      </div>

      <div
        className="mx-auto flex w-full flex-1 flex-col justify-center gap-5 sm:gap-6"
        style={{ zoom: 1.25 }}
      >
        {/* Uniform block: shirts then shorts directly underneath */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-6">
          <GarmentPanel label="SHIRT • FRONT">
            <ShirtFront />
            {node("chest_center")}
            {node("right_sleeve")}
            {node("left_sleeve")}
          </GarmentPanel>

          <GarmentPanel label="SHIRT • BACK">
            <ShirtBack />
            {node("upper_back")}
            {node("lower_back")}
          </GarmentPanel>

          <GarmentPanel
            label="SHORTS"
            className="col-span-2 mx-auto w-full max-w-[300px]"
          >
            <Shorts />
            {node("shorts_right")}
            {node("shorts_left")}
          </GarmentPanel>
        </div>

        {/* Accessories */}
        <div
          className={`grid gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-6 ${
            isPositionActive("cap_front") ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {isPositionActive("cap_front") && (
            <GarmentPanel label="CAP">
              <Cap />
              {node("cap_front")}
            </GarmentPanel>
          )}

          <GarmentPanel
            label="SOCKS"
            className={
              isPositionActive("cap_front")
                ? undefined
                : "mx-auto w-full max-w-[300px]"
            }
          >
            <Socks />
            {node("left_sock")}
            {node("right_sock")}
          </GarmentPanel>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-zinc-100 pt-5 text-xs text-zinc-500">
        <Legend swatch="border-2 border-zinc-900 bg-white" text="Available" />
        <Legend swatch="bg-[#059669]" text="Selected" />
        <Legend swatch="bg-[#3F3F46]" text="Sold" />
      </div>
    </div>
  );
}

function GarmentPanel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">{children}</div>
      <p className="mt-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
    </div>
  );
}

function Legend({ swatch, text }: { swatch: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`block h-4 w-4 rounded-full ${swatch}`} />
      {text}
    </div>
  );
}

const svgBase = {
  width: "100%" as const,
  display: "block" as const,
  overflow: "visible" as const,
};

/** Dashed placement zone rectangle (viewBox units). */
function AdZone({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="rgba(255,255,255,0.35)"
      stroke={ZONE}
      strokeWidth="1.5"
      strokeDasharray="5 3.5"
      rx="4"
    />
  );
}

/**
 * Lucide "shirt" silhouette (ISC) — recognizable crew-neck tee with
 * hanging short sleeves. Scaled 10× from the 24×24 icon path.
 * https://lucide.dev/icons/shirt
 */
const TEE_OUTLINE =
  "M 203.8 34.6 L 160 20 A 40 40 0 0 1 80 20 L 36.2 34.6 A 20 20 0 0 0 22.8 56.9 L 28.6 91.6 A 10 10 0 0 0 38.5 100 H 60 V 200 C 60 211 69 220 80 220 H 160 C 171 220 180 211 180 200 V 100 H 201.5 A 10 10 0 0 0 211.4 91.6 L 217.2 56.9 A 20 20 0 0 0 203.8 34.6 Z";

function ShirtFront() {
  return (
    <svg viewBox="0 0 240 240" style={svgBase} aria-hidden>
      <path
        d={TEE_OUTLINE}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Collar seam hint */}
      <path
        d="M 88 48 C 100 68 140 68 152 48"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Placement zones — 01 high chest / bib (centered) + sleeves */}
      <AdZone x={84} y={78} w={72} h={50} />
      <AdZone x={14} y={41} w={50} h={42} />
      <AdZone x={176} y={41} w={50} h={42} />
    </svg>
  );
}

function ShirtBack() {
  return (
    <svg viewBox="0 0 240 240" style={svgBase} aria-hidden>
      <path
        d={TEE_OUTLINE}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Shallower back-neck hint */}
      <path
        d="M 90 44 C 104 56 136 56 150 44"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      <AdZone x={72} y={84} w={96} h={48} />
      <AdZone x={72} y={139} w={96} h={54} />
    </svg>
  );
}

function Cap() {
  return (
    <svg viewBox="0 0 200 120" style={svgBase} aria-hidden>
      <path
        d="M36 70 C36 34 62 18 100 18 C138 18 160 38 162 70 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M36 70 L164 70 C182 70 194 78 194 86 C194 92 188 94 178 94 L36 94 Z"
        fill="#E8E8E3"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Front crown panel */}
      <AdZone x={67} y={20} w={66} h={48} />
    </svg>
  );
}

function Socks() {
  return (
    <svg viewBox="0 0 200 160" style={svgBase} aria-hidden>
      <path
        d="M32 12 L68 12 L68 106 L92 106 Q100 106 100 118 L100 132 Q100 144 88 144 L44 144 Q32 144 32 132 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M168 12 L132 12 L132 106 L108 106 Q100 106 100 118 L100 132 Q100 144 112 144 L156 144 Q168 144 168 132 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <AdZone x={32} y={19} w={36} h={54} />
      <AdZone x={132} y={19} w={36} h={54} />
    </svg>
  );
}

function Shorts() {
  return (
    <svg viewBox="0 0 200 170" style={svgBase} aria-hidden>
      <path
        d="M36 18 L164 18 L170 34 L158 148 L112 148 L100 70 L88 148 L42 148 L30 34 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Waistband */}
      <path
        d="M34 36 L166 36"
        stroke={STROKE}
        strokeWidth="2"
        fill="none"
      />
      {/* Crotch seam */}
      <path
        d="M100 36 L100 70"
        stroke={STROKE}
        strokeWidth="1.75"
        fill="none"
      />
      <AdZone x={39} y={46} w={54} h={72} />
      <AdZone x={107} y={46} w={54} h={72} />
    </svg>
  );
}
