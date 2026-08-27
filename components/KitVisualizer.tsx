"use client";

/**
 * Minimal filled kit silhouettes with dashed ad zones and hotspot badges.
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
  chest_center: { x: 24, y: 26, w: 10, h: 8.5 },
  left_chest: { x: 15.5, y: 25, w: 7, h: 6.5 },
  upper_back: { x: 68, y: 24.5, w: 13, h: 7 },
  lower_back: { x: 68, y: 35, w: 13, h: 7 },
  shorts_left: { x: 34, y: 61, w: 9, h: 9 },
  left_sock: { x: 34.5, y: 84.5, w: 8, h: 6 },
  right_sock: { x: 47, y: 84.5, w: 8, h: 6 },
};

/** Badge anchor points (%). Offset slightly outside zones for readability. */
const BADGE_POS: Record<string, { x: number; y: number }> = {
  cap_front: { x: 44, y: 9 },
  chest_center: { x: 42, y: 30 },
  left_chest: { x: 7, y: 28 },
  upper_back: { x: 92, y: 27 },
  lower_back: { x: 92, y: 38 },
  shorts_left: { x: 22, y: 65 },
  left_sock: { x: 26, y: 90 },
  right_sock: { x: 64, y: 90 },
};

const FILL = "#F1F5F9";
const STROKE = "#CBD5E1";
const ZONE_STROKE = "#94A3B8";
const LABEL = "#94A3B8";

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

          {/* ——— VEST FRONT ——— */}
          <g
            opacity={
              hoveredId &&
              !["chest_center", "left_chest"].includes(hoveredId)
                ? 0.4
                : 1
            }
            className="transition-opacity duration-300"
          >
            <path
              d="M55 120 L85 145 L85 275 C85 285 95 290 110 290 L170 290 C185 290 195 285 195 275 L195 145 L225 120 L210 105 L185 135 L175 115 Q140 135 105 115 L95 135 L70 105 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M105 118 Q140 138 175 118"
              fill="none"
              stroke={STROKE}
              strokeWidth="1.25"
            />
            <text
              x="140"
              y="312"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.06em"
            >
              VEST · FRONT
            </text>
          </g>

          {/* ——— VEST BACK ——— */}
          <g
            opacity={
              hoveredId &&
              !["upper_back", "lower_back"].includes(hoveredId)
                ? 0.4
                : 1
            }
            className="transition-opacity duration-300"
          >
            <path
              d="M275 120 L305 145 L305 275 C305 285 315 290 330 290 L390 290 C405 290 415 285 415 275 L415 145 L445 120 L430 105 L405 135 L395 115 Q360 135 325 115 L315 135 L290 105 Z"
              fill={FILL}
              stroke={STROKE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M325 118 Q360 138 395 118"
              fill="none"
              stroke={STROKE}
              strokeWidth="1.25"
            />
            <text
              x="360"
              y="312"
              fill={LABEL}
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.06em"
            >
              VEST · BACK
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
                    ? "rgba(241,245,249,0.6)"
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
            <span className="px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400">
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
                  className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-600 hover:text-white sm:px-3 sm:text-[11px]"
                  aria-label={`Claim ${slot.slot_name} for ${formatPrice(slot.price_gbp)}`}
                >
                  <span className="sm:hidden">{formatPrice(slot.price_gbp)}</span>
                  <span className="hidden sm:inline">
                    {label} • {formatPrice(slot.price_gbp)}
                  </span>
                </button>
              ) : isSold ? (
                <div
                  className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-400 sm:px-3 sm:text-[11px]"
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

      <p className="mt-5 text-center text-sm text-slate-500">
        Select an available placement to claim your spot on race day.
      </p>
    </div>
  );
}
