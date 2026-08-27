"use client";

/**
 * Kit blueprint: plain t-shirt / shorts / cap / socks silhouettes
 * with numbered circular placement nodes.
 */
import type { ReactNode } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";
import { MARKER_POS, ZONE_META, type ZoneId } from "@/lib/zones";

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

  function node(id: ZoneId) {
    const slot = byId.get(id);
    const meta = ZONE_META.find((z) => z.id === id);
    const pos = MARKER_POS[id];
    if (!slot || !meta || !pos) return null;

    const isSelected = selectedIds.has(id);
    const isHovered = hoveredId === id;
    const isSold = slot.status === "sold";
    const isPending = slot.status === "pending";
    const available = slot.status === "available";

    let bg = "#FFFFFF";
    let border = INK;
    let color = INK;

    if (isSold) {
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

    const size = isSold ? Math.max(pos.size, 36) : pos.size;

    return (
      <button
        key={id}
        type="button"
        disabled={!available}
        title={
          isSold
            ? `${slot.slot_name} — Sold`
            : `${slot.slot_name} — £${slot.price_gbp}`
        }
        aria-pressed={isSelected}
        aria-label={`${meta.num} ${slot.slot_name}`}
        onClick={() => available && onToggle(slot)}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        className="absolute flex items-center justify-center rounded-full border-[1.5px] font-mono text-[10px] font-medium transition-all duration-150"
        style={{
          left: pos.left,
          top: pos.top,
          width: isSold ? size + 10 : size,
          height: size,
          background: bg,
          borderColor: border,
          color,
          cursor: available ? "pointer" : "not-allowed",
          boxShadow: isHovered ? "0 0 0 4px rgba(5,150,105,0.18)" : undefined,
          zIndex: isHovered ? 20 : 10,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
        }}
      >
        {isSold ? (
          <span className="px-0.5 text-[8px] font-semibold tracking-wide">
            SOLD
          </span>
        ) : (
          meta.num
        )}
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E4E4E7] bg-white p-6 sm:p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Race-day kit
        </p>
        <h2 className="mt-1 text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
          Pick your placement.
        </h2>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8">
        {/* Uniform block: shirts then shorts directly underneath */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <GarmentPanel label="SHIRT • FRONT">
            <ShirtFront />
            {node("chest_center")}
            {node("left_chest")}
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
            className="col-span-2 mx-auto w-full max-w-[200px]"
          >
            <Shorts />
            {node("shorts_left")}
          </GarmentPanel>
        </div>

        {/* Accessories */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <GarmentPanel label="CAP">
            <Cap />
            {node("cap_front")}
          </GarmentPanel>

          <GarmentPanel label="SOCKS">
            <Socks />
            {node("left_sock")}
            {node("right_sock")}
          </GarmentPanel>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-zinc-100 pt-5 text-xs text-zinc-500">
        <Legend swatch="border border-zinc-900 bg-white" text="Available" />
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
      <span className={`block h-3.5 w-3.5 rounded-full ${swatch}`} />
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
      strokeWidth="1.25"
      strokeDasharray="4 3"
      rx="3"
    />
  );
}

/**
 * Classic short-sleeve crew-neck tee.
 * Walks left cuff → left sleeve tip → shoulder → collar → neck →
 * right collar → shoulder → sleeve tip → cuff → side → hem → close.
 */
const TEE_OUTLINE =
  "M 58 98 L 24 74 L 56 52 L 84 70 L 96 46 C 110 30 130 30 144 46 L 156 70 L 184 52 L 216 74 L 182 98 L 170 108 L 170 252 L 70 252 L 70 108 Z";

function ShirtFront() {
  return (
    <svg viewBox="0 0 240 270" style={svgBase} aria-hidden>
      <path
        d={TEE_OUTLINE}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Crew neck opening */}
      <path
        d="M 84 70 C 98 96 142 96 156 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Inner collar */}
      <path
        d="M 90 74 C 102 92 138 92 150 74"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        opacity="0.5"
      />
      {/* Sleeve / body seams */}
      <path
        d="M 70 108 L 84 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <path
        d="M 170 108 L 156 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />

      {/* Placement zones */}
      <AdZone x={98} y={120} w={44} h={36} />
      <AdZone x={144} y={110} w={28} h={24} />
      <AdZone x={30} y={74} w={32} h={22} />
      <AdZone x={178} y={74} w={32} h={22} />
    </svg>
  );
}

function ShirtBack() {
  return (
    <svg viewBox="0 0 240 270" style={svgBase} aria-hidden>
      <path
        d={TEE_OUTLINE}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Shallower back neck */}
      <path
        d="M 84 70 C 98 86 142 86 156 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 70 108 L 84 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <path
        d="M 170 108 L 156 70"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
      />

      <AdZone x={88} y={102} w={64} h={32} />
      <AdZone x={88} y={162} w={64} h={36} />
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
      <AdZone x={78} y={28} w={44} h={32} />
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
      <AdZone x={38} y={28} w={24} h={36} />
      <AdZone x={138} y={28} w={24} h={36} />
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
      <AdZone x={48} y={58} w={36} h={48} />
    </svg>
  );
}
