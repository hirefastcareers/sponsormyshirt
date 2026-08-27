"use client";

import { useCallback } from "react";

/** Lucide shirt icon — same path as `BrandMark`. */
const SHIRT_PATH =
  "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z";

const SIZE = 400;
const BG = "#F9F9FB";
const BADGE = "#18181b";
const ICON = "#ffffff";
const BADGE_DIAMETER = 280;
const ICON_SIZE = 175;

function drawAvatar(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = BADGE_DIAMETER / 2;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = BADGE;
  ctx.fill();

  const scale = ICON_SIZE / 24;
  ctx.fillStyle = ICON;
  ctx.save();
  ctx.translate(cx - ICON_SIZE / 2, cy - ICON_SIZE / 2);
  ctx.scale(scale, scale);
  ctx.fill(new Path2D(SHIRT_PATH));
  ctx.restore();
}

export default function AvatarPreview() {
  const downloadPng = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawAvatar(ctx);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sponsormyshirt-x-avatar.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        id="avatar-export"
        className="relative shrink-0"
        style={{ width: SIZE, height: SIZE }}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: BG }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: BADGE_DIAMETER,
              height: BADGE_DIAMETER,
              backgroundColor: BADGE,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
              style={{ width: ICON_SIZE, height: ICON_SIZE, color: ICON }}
            >
              <path d={SHIRT_PATH} />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Download 400×400 PNG
        </button>
        <p className="max-w-sm text-center text-sm text-zinc-500">
          Screenshot the square above or use the button for a crisp PNG sized
          for your X profile picture.
        </p>
      </div>
    </div>
  );
}
