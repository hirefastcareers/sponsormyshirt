"use client";

/**
 * Kit blueprint: off-white garment silhouettes with numbered circular nodes.
 */
import type { ReactNode } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";
import { MARKER_POS, ZONE_META, type ZoneId } from "@/lib/zones";

const FILL = "#EFEFEA";
const STROKE = "#D4D4D8";
const LABEL = "#A1A1AA";
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

      <div className="mx-auto grid w-full max-w-xl flex-1 grid-cols-2 gap-x-8 gap-y-10 content-center">
        {/* Shirt front */}
        <GarmentPanel label="SHIRT • FRONT">
          <ShirtFront />
          {node("chest_center")}
          {node("left_chest")}
          {node("right_sleeve")}
          {node("left_sleeve")}
        </GarmentPanel>

        {/* Shirt back */}
        <GarmentPanel label="SHIRT • BACK">
          <ShirtBack />
          {node("upper_back")}
          {node("lower_back")}
        </GarmentPanel>

        {/* Cap */}
        <GarmentPanel label="CAP">
          <Cap />
          {node("cap_front")}
        </GarmentPanel>

        {/* Socks */}
        <GarmentPanel label="SOCKS">
          <Socks />
          {node("left_sock")}
          {node("right_sock")}
        </GarmentPanel>

        {/* Shorts — spans center under socks/cap row on larger layouts */}
        <GarmentPanel label="SHORTS" className="col-span-2 mx-auto w-full max-w-[220px]">
          <Shorts />
          {node("shorts_left")}
        </GarmentPanel>
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

function ShirtFront() {
  return (
    <svg viewBox="0 0 200 220" style={svgBase} aria-hidden>
      {/*
        Short-sleeve tee:
        left cuff → left shoulder → crew neck → right shoulder → right cuff → hem
      */}
      <path
        d="M28 72 L34 48 L62 42 L78 62 L90 38 C100 26 120 26 130 38 L142 62 L158 42 L186 48 L192 72 L168 86 L168 200 L32 200 L32 86 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M78 62 C90 76 130 76 142 62"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShirtBack() {
  return (
    <svg viewBox="0 0 200 220" style={svgBase} aria-hidden>
      <path
        d="M28 72 L34 48 L62 42 L78 62 L90 38 C100 26 120 26 130 38 L142 62 L158 42 L186 48 L192 72 L168 86 L168 200 L32 200 L32 86 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M78 62 C90 72 130 72 142 62"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cap() {
  return (
    <svg viewBox="0 0 200 120" style={svgBase} aria-hidden>
      {/* Crown / front panel */}
      <path
        d="M36 70 C36 34 62 18 100 18 C138 18 160 38 162 70 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Brim */}
      <path
        d="M36 70 L164 70 C182 70 194 78 194 86 C194 92 188 94 178 94 L36 94 Z"
        fill="#E8E8E3"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
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
    </svg>
  );
}

function Shorts() {
  return (
    <svg viewBox="0 0 200 180" style={svgBase} aria-hidden>
      <path
        d="M38 22 L162 22 L156 150 L114 150 L100 74 L86 150 L44 150 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M39 40 L161 40" stroke={STROKE} strokeWidth="2.5" fill="none" />
    </svg>
  );
}
