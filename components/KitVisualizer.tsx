"use client";

/**
 * Minimal filled kit silhouettes with dashed ad zones and hotspot badges.
 * Top garment is a short-sleeve athletic t-shirt (front + back).
 * Badge / logo positions are keyed by slot id to match the SVG layout.
 */
import { useMemo, useState } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface KitVisualizerProps {
  slots: SponsorshipSlot[];
  onSelectSlot: (slot: SponsorshipSlot) => void;
}

/** Zone boxes in % of the visualizer stage (for logos + dash overlays). */
const SLOT_ZONES: Record<
  string,
  { x: number; y: number; w: number; h: number }
> = {
  cap_front: { x: 19, y: 7.5, w: 12, h: 4.2 },
  // Front torso
  chest_center: { x: 23.5, y: 27, w: 11, h: 9 },
  left_chest: { x: 15, y: 26, w: 7, h: 6.5 },
  // Sleeves (budget add-ons)
  left_sleeve: { x: 5.5, y: 22.5, w: 7.5, h: 5.5 },
  right_sleeve: { x: 36.5, y: 22.5, w: 7.5, h: 5.5 },
  // Back torso
  upper_back: { x: 64.5, y: 25.5, w: 14, h: 7.5 },
  lower_back: { x: 64.5, y: 36, w: 14, h: 7.5 },
  shorts_left: { x: 34, y: 61, w: 9, h: 9 },
  left_sock: { x: 34.5, y: 84.5, w: 8, h: 6 },
  right_sock: { x: 47, y: 84.5, w: 8, h: 6 },
};

/** Badge anchor points (%). Offset slightly outside zones for readability. */
const BADGE_POS: Record<string, { x: number; y: number }> = {
  cap_front: { x: 44, y: 9 },
  chest_center: { x: 42, y: 31 },
  left_chest: { x: 8, y: 29 },
  left_sleeve: { x: 4, y: 19 },
  right_sleeve: { x: 46, y: 19 },
  upper_back: { x: 92, y: 28 },
  lower_back: { x: 92, y: 40 },
  shorts_left: { x: 22, y: 65 },
  left_sock: { x: 26, y: 90 },
  right_sock: { x: 64, y: 90 },
};

const FILL = "#F4F4F5";
const STROKE = "#D4D4D8";
const ZONE_STROKE = "#A1A1AA";
const LABEL = "#A1A1AA";

const FRONT_SHIRT_SLOTS = [
  "chest_center",
  "left_chest",
  "left_sleeve",
  "right_sleeve",
];
const BACK_SHIRT_SLOTS = ["upper_back", "lower_back"];

function formatPrice(gbp: number) {
  return `£${gbp}`;
}

function shortLabel(name: string) {
  const first = name.split(/[\s/]/)[0];
  return first || name;
}

export default function KitVisualizer({
  slots,
  onSelectSlot,
}: KitVisualizerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, SponsorshipSlot>();
    for (const slot of slots) map.set(slot.id, slot);
    return map;
  }, [slots]);

  return (
    <div className="relative w-full">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-lg sm:aspect-[3/4] sm:max-w-xl">
        <svg
          viewBox="0 0 480 580"
          className="h-full w-full"
          role="img"
          aria-label="Running kit with sponsorship placement zones"
        >
          {/* ——— CAP ——— */}
          <g
            opacity={hoveredId && hoveredId !== "cap_front" ? 0.4 : 1}
            className="transition-opacity duration-300"
          >
            <path
              d="M70 42 C90 12 150 12 170 42 L178 66 L62 66 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M170 46 L210 62 L170 62 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <text
              x="120"
              y="86"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.08em"
            >
              CAP
            </text>
          </g>

          {/* ——— T-SHIRT FRONT (short sleeves + crew neck) ——— */}
          <g
            opacity={
              hoveredId && !FRONT_SHIRT_SLOTS.includes(hoveredId) ? 0.4 : 1
            }
            className="transition-opacity duration-300"
          >
            {/*
              Athletic short-sleeve tee:
              left cuff → left shoulder → crew neck → right shoulder →
              right cuff → right armpit → hem → left armpit → close
            */}
            <path
              d="M32 178
                 L38 148
                 L72 138
                 L92 155
                 L108 128
                 C122 116 158 116 172 128
                 L188 155
                 L208 138
                 L242 148
                 L248 178
                 L212 192
                 L212 278
                 C212 288 202 294 188 294
                 L92 294
                 C78 294 68 288 68 278
                 L68 192
                 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Crew-neck collar opening */}
            <path
              d="M108 128 C120 142 160 142 172 128"
              fill="none"
              stroke={STROKE}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            {/* Inner collar hint */}
            <path
              d="M112 130 C122 140 158 140 168 130"
              fill="none"
              stroke={STROKE}
              strokeWidth="0.9"
              opacity="0.55"
            />
            <text
              x="140"
              y="316"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.06em"
            >
              TEE · FRONT
            </text>
          </g>

          {/* ——— T-SHIRT BACK (short sleeves + crew neck) ——— */}
          <g
            opacity={
              hoveredId && !BACK_SHIRT_SLOTS.includes(hoveredId) ? 0.4 : 1
            }
            className="transition-opacity duration-300"
          >
            <path
              d="M252 178
                 L258 148
                 L292 138
                 L312 155
                 L328 128
                 C340 118 360 114 360 114
                 C360 114 380 118 392 128
                 L408 155
                 L428 138
                 L462 148
                 L468 178
                 L432 192
                 L432 278
                 C432 288 422 294 408 294
                 L312 294
                 C298 294 288 288 288 278
                 L288 192
                 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Back crew-neck line */}
            <path
              d="M328 128 C340 138 380 138 392 128"
              fill="none"
              stroke={STROKE}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <text
              x="360"
              y="316"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.06em"
            >
              TEE · BACK
            </text>
          </g>

          {/* ——— SHORTS ——— */}
          <g
            opacity={hoveredId && hoveredId !== "shorts_left" ? 0.4 : 1}
            className="transition-opacity duration-300"
          >
            <path
              d="M155 340 L325 340 L332 355 L300 450 L255 450 L240 370 L225 450 L180 450 L148 355 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="240"
              y1="340"
              x2="240"
              y2="370"
              stroke={STROKE}
              strokeWidth="1.25"
            />
            <text
              x="240"
              y="472"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.08em"
            >
              SHORTS
            </text>
          </g>

          {/* ——— SOCKS ——— */}
          <g
            opacity={
              hoveredId &&
              !["left_sock", "right_sock"].includes(hoveredId)
                ? 0.4
                : 1
            }
            className="transition-opacity duration-300"
          >
            <path
              d="M168 490 L168 530 C168 543 175 547 185 547 L198 547 C208 547 212 543 212 530 L212 490 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M228 490 L228 530 C228 543 235 547 245 547 L258 547 C268 547 272 543 272 530 L272 490 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <text
              x="220"
              y="568"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.08em"
            >
              SOCKS
            </text>
          </g>

          {/* Dashed ad zones */}
          {Object.entries(SLOT_ZONES).map(([id, zone]) => {
            const active = hoveredId === id;
            const slot = byId.get(id);
            const claimed = slot?.status === "sold";
            return (
              <rect
                key={`zone-${id}`}
                x={(zone.x / 100) * 480}
                y={(zone.y / 100) * 580}
                width={(zone.w / 100) * 480}
                height={(zone.h / 100) * 580}
                fill={
                  claimed
                    ? "rgba(244,244,245,0.65)"
                    : "rgba(255,255,255,0.35)"
                }
                stroke={active ? "#059669" : ZONE_STROKE}
                strokeWidth={active ? 1.75 : 1.25}
                strokeDasharray="5 4"
                rx="3"
                className="transition-all duration-300"
                opacity={hoveredId && hoveredId !== id ? 0.35 : 1}
              />
            );
          })}
        </svg>

        {/* Sold logos centered in zones */}
        {slots.map((slot) => {
          if (slot.status !== "sold") return null;
          const zone = SLOT_ZONES[slot.id];
          if (!zone) return null;

          const content = slot.sponsor_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.sponsor_logo_url}
              alt={slot.sponsor_name ?? "Sponsor logo"}
              className="max-h-full max-w-full object-contain p-0.5"
            />
          ) : (
            <span className="px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
              Sold
            </span>
          );

          const wrapperClass =
            "absolute flex items-center justify-center overflow-hidden rounded-sm bg-white/90 shadow-sm";
          const style = {
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.w}%`,
            height: `${zone.h}%`,
          };
          const title = slot.sponsor_name
            ? `Sponsored by ${slot.sponsor_name}`
            : "Sponsor";

          if (slot.sponsor_url) {
            return (
              <a
                key={`logo-${slot.id}`}
                href={slot.sponsor_url}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className={`${wrapperClass} transition hover:shadow-md`}
                style={style}
                onMouseEnter={() => setHoveredId(slot.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {content}
                <span className="absolute bottom-0.5 right-0.5 rounded bg-zinc-900/80 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-white">
                  Claimed
                </span>
              </a>
            );
          }

          return (
            <div
              key={`logo-${slot.id}`}
              title={title}
              className={wrapperClass}
              style={style}
              onMouseEnter={() => setHoveredId(slot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {content}
              <span className="absolute bottom-0.5 right-0.5 rounded bg-zinc-900/80 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-white">
                Claimed
              </span>
            </div>
          );
        })}

        {/* Hotspot badges */}
        {slots.map((slot) => {
          const pos = BADGE_POS[slot.id] ?? {
            x: slot.x_position,
            y: slot.y_position,
          };
          const isAvailable = slot.status === "available";
          const isSold = slot.status === "sold";
          const isPending = slot.status === "pending";
          const isHovered = hoveredId === slot.id;
          const label = shortLabel(slot.slot_name);

          return (
            <div
              key={`badge-${slot.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isHovered ? 30 : 15,
              }}
              onMouseEnter={() => setHoveredId(slot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {isAvailable ? (
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className="origin-center cursor-pointer rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-black hover:text-white sm:px-3 sm:text-[11px]"
                  aria-label={`Claim ${slot.slot_name} for ${formatPrice(slot.price_gbp)}`}
                >
                  <span className="sm:hidden">{formatPrice(slot.price_gbp)}</span>
                  <span className="hidden sm:inline">
                    {label} • {formatPrice(slot.price_gbp)}
                  </span>
                </button>
              ) : isSold ? (
                <div
                  className="cursor-not-allowed rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 sm:px-3 sm:text-[11px]"
                  title={
                    slot.sponsor_name
                      ? `Sponsored by ${slot.sponsor_name}`
                      : "Sold"
                  }
                >
                  <span className="sm:hidden">Sold</span>
                  <span className="hidden sm:inline">{label} • Sold</span>
                </div>
              ) : isPending ? (
                <div className="cursor-not-allowed rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 sm:px-3 sm:text-[11px]">
                  Pending
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Select an available placement to claim your spot on race day.
      </p>
    </div>
  );
}
