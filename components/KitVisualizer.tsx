"use client";

/**
 * Architectural wireframe of race-day kit with interactive sponsorship pins.
 * Coordinates come from sponsorship_slots.x_position / y_position (0–100 %).
 */
import { useState } from "react";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface KitVisualizerProps {
  slots: SponsorshipSlot[];
  onSelectSlot: (slot: SponsorshipSlot) => void;
}

function formatPrice(gbp: number) {
  return `£${gbp}`;
}

export default function KitVisualizer({
  slots,
  onSelectSlot,
}: KitVisualizerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-none border border-emerald-500/20 bg-slate-950/80">
      {/* Blueprint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16,185,129,0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16,185,129,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_65%)]" />

      <div className="relative px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80">
            Fig. 01 — Race Kit Blueprint
          </p>
          <p className="font-mono text-[10px] text-slate-500">
            SCALE 1:1 · INTERACTIVE
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-lg sm:aspect-[3/4] sm:max-w-xl">
          <svg
            viewBox="0 0 400 500"
            className="h-full w-full"
            role="img"
            aria-label="Running kit blueprint with sponsorship placement pins"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Construction guides */}
            <line
              x1="200"
              y1="20"
              x2="200"
              y2="480"
              stroke="#10b981"
              strokeOpacity="0.15"
              strokeDasharray="4 6"
            />

            {/* ——— CAP ——— */}
            <g
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
              className="transition-opacity duration-300"
              opacity={hoveredId && !["cap_front"].includes(hoveredId) ? 0.35 : 1}
            >
              <path d="M60 55 Q90 20 120 55" />
              <path d="M55 55 L125 55 L130 70 L50 70 Z" />
              <path d="M125 58 L155 68 L125 68" />
              <text
                x="90"
                y="90"
                fill="#64748b"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                CAP
              </text>
            </g>

            {/* ——— VEST (front) ——— */}
            <g
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
              opacity={
                hoveredId &&
                !["chest_center", "left_chest"].includes(hoveredId)
                  ? 0.35
                  : 1
              }
              className="transition-opacity duration-300"
            >
              <path d="M145 110 L165 130 L165 230 L235 230 L235 130 L255 110 L270 125 L250 155 L250 250 L150 250 L150 155 L130 125 Z" />
              {/* Neck */}
              <path d="M175 118 Q200 135 225 118" />
              {/* Heart zone highlight */}
              <circle
                cx="175"
                cy="155"
                r="18"
                stroke="#10b981"
                strokeOpacity={hoveredId === "left_chest" ? 0.7 : 0.2}
                strokeDasharray="3 3"
              />
              {/* Center chest zone */}
              <rect
                x="185"
                y="145"
                width="30"
                height="40"
                stroke="#10b981"
                strokeOpacity={hoveredId === "chest_center" ? 0.7 : 0.2}
                strokeDasharray="3 3"
              />
              <text
                x="200"
                y="270"
                fill="#64748b"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                VEST · FRONT
              </text>
            </g>

            {/* ——— VEST (back panel) ——— */}
            <g
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
              opacity={
                hoveredId &&
                !["upper_back", "lower_back"].includes(hoveredId)
                  ? 0.35
                  : 1
              }
              className="transition-opacity duration-300"
            >
              <path d="M290 120 L310 140 L310 250 L370 250 L370 140 L390 120 L375 110 L355 135 L355 115 L305 115 L305 135 L285 110 Z" />
              <rect
                x="320"
                y="145"
                width="40"
                height="28"
                stroke="#10b981"
                strokeOpacity={hoveredId === "upper_back" ? 0.7 : 0.2}
                strokeDasharray="3 3"
              />
              <rect
                x="320"
                y="195"
                width="40"
                height="28"
                stroke="#10b981"
                strokeOpacity={hoveredId === "lower_back" ? 0.7 : 0.2}
                strokeDasharray="3 3"
              />
              <text
                x="340"
                y="270"
                fill="#64748b"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                VEST · BACK
              </text>
            </g>

            {/* ——— SHORTS ——— */}
            <g
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
              opacity={
                hoveredId && hoveredId !== "shorts_left" ? 0.35 : 1
              }
              className="transition-opacity duration-300"
            >
              <path d="M155 290 L245 290 L250 300 L230 380 L200 380 L200 310 L200 380 L170 380 L150 300 Z" />
              <rect
                x="160"
                y="320"
                width="28"
                height="40"
                stroke="#10b981"
                strokeOpacity={hoveredId === "shorts_left" ? 0.7 : 0.2}
                strokeDasharray="3 3"
              />
              <text
                x="200"
                y="400"
                fill="#64748b"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                SHORTS
              </text>
            </g>

            {/* ——— SOCKS ——— */}
            <g
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
              opacity={
                hoveredId &&
                !["left_sock", "right_sock"].includes(hoveredId)
                  ? 0.35
                  : 1
              }
              className="transition-opacity duration-300"
            >
              <path d="M165 420 L165 460 L155 475 L175 475 L180 460 L180 420 Z" />
              <path d="M220 420 L220 460 L210 475 L230 475 L235 460 L235 420 Z" />
              <text
                x="200"
                y="495"
                fill="#64748b"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                SOCKS
              </text>
            </g>

            {/* Interactive pins — HTML overlay for logos + buttons */}
          </svg>

          {/* Pin layer (HTML for logos + accessibility) */}
          {slots.map((slot) => {
            const isAvailable = slot.status === "available";
            const isSold = slot.status === "sold";
            const isPending = slot.status === "pending";
            const isHovered = hoveredId === slot.id;

            return (
              <div
                key={slot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${slot.x_position}%`,
                  top: `${slot.y_position}%`,
                  zIndex: isHovered ? 20 : 10,
                }}
                onMouseEnter={() => setHoveredId(slot.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {isSold && slot.sponsor_logo_url ? (
                  <a
                    href={slot.sponsor_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-1"
                    title={slot.sponsor_name ?? "Sponsor"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slot.sponsor_logo_url}
                      alt={slot.sponsor_name ?? "Sponsor logo"}
                      className="h-10 w-10 rounded-sm border border-slate-600 bg-white object-contain p-0.5 shadow-lg sm:h-12 sm:w-12"
                    />
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-300 ring-1 ring-slate-600">
                      [SOLD]
                    </span>
                  </a>
                ) : isSold ? (
                  <div className="rounded bg-slate-800 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300 ring-1 ring-slate-600">
                    [SOLD]
                  </div>
                ) : isPending ? (
                  <div className="rounded bg-amber-950/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 ring-1 ring-amber-500/40">
                    Pending
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => isAvailable && onSelectSlot(slot)}
                    className={`group relative flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-all duration-300 sm:text-[11px] ${
                      isHovered
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-105"
                        : "border-emerald-500/50 bg-slate-950/90 text-emerald-400"
                    } animate-pulse-emerald`}
                    aria-label={`Sponsor ${slot.slot_name} for ${formatPrice(slot.price_gbp)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                        isHovered ? "" : "animate-ping-slow"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {slot.slot_name.split(" ")[0]}
                    </span>
                    <span className="text-emerald-300">
                      {formatPrice(slot.price_gbp)}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-slate-500">
          Click an emerald pin to claim that placement on race day.
        </p>
      </div>
    </div>
  );
}
