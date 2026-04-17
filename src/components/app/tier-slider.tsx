"use client";

import { useCallback, useRef, useState } from "react";

export type TierTone = "sky" | "green" | "yellow" | "orange" | "red";

export interface TierSegment {
  label: string;
  tone: TierTone;
}

interface TierSliderProps {
  /** N tier segments, left-to-right. */
  segments: TierSegment[];
  /** N-1 boundary values, strictly increasing, each ≥ min and ≤ max. */
  values: number[];
  min: number;
  max: number;
  step: number;
  /** Unit suffix shown after each boundary value (e.g. "lb", "%"). */
  suffix: string;
  onChange: (values: number[]) => void;
}

const FILL: Record<TierTone, string> = {
  sky: "bg-sky-500/35 dark:bg-sky-500/30",
  green: "bg-green-500/35 dark:bg-green-500/30",
  yellow: "bg-yellow-500/35 dark:bg-yellow-500/30",
  orange: "bg-orange-500/35 dark:bg-orange-500/30",
  red: "bg-red-500/35 dark:bg-red-500/30",
};

const LABEL: Record<TierTone, string> = {
  sky: "text-sky-600 dark:text-sky-400",
  green: "text-green-600 dark:text-green-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

const DOT: Record<TierTone, string> = {
  sky: "bg-sky-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

/**
 * Multi-thumb slider. `segments.length === values.length + 1` — each segment is
 * bounded by the previous thumb (or `min`) and the next thumb (or `max`).
 * Thumbs cannot cross their neighbours; when dragged past one they clamp to a
 * single-step gap. Values snap to `step`.
 */
export function TierSlider({
  segments,
  values,
  min,
  max,
  step,
  suffix,
  onChange,
}: TierSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  function pctOf(v: number): number {
    return ((v - min) / (max - min)) * 100;
  }

  function clientXToValue(clientX: number): number {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    return clampToRange(stepped, min, max);
  }

  function clampThumb(idx: number, v: number): number {
    const left = idx > 0 ? values[idx - 1] + step : min;
    const right = idx < values.length - 1 ? values[idx + 1] - step : max;
    return clampToRange(v, left, right);
  }

  const onPointerDown = useCallback(
    (idx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(idx);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragging === null) return;
      const raw = clientXToValue(e.clientX);
      const next = [...values];
      next[dragging] = clampThumb(dragging, raw);
      onChange(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, values]
  );

  const endDrag = useCallback(() => setDragging(null), []);

  function nudge(idx: number, delta: number) {
    const next = [...values];
    next[idx] = clampThumb(idx, values[idx] + delta);
    onChange(next);
  }

  const boundaries = [min, ...values, max];

  return (
    <div className="select-none space-y-2">
      {/* Tier labels above each segment */}
      <div className="flex items-end">
        {segments.map((seg, i) => {
          const width = ((boundaries[i + 1] - boundaries[i]) / (max - min)) * 100;
          return (
            <div
              key={i}
              className="flex min-w-0 items-center justify-center gap-1.5 px-1"
              style={{ width: `${width}%` }}
            >
              <span className={`inline-block size-1.5 shrink-0 rounded-full ${DOT[seg.tone]}`} />
              <span
                className={`truncate text-[10px] font-bold uppercase tracking-wider ${LABEL[seg.tone]}`}
              >
                {seg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Track with coloured segments + draggable thumbs */}
      <div
        ref={trackRef}
        className="relative h-9 touch-none rounded-lg bg-surface-low"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {segments.map((seg, i) => {
          const leftPct = ((boundaries[i] - min) / (max - min)) * 100;
          const width = ((boundaries[i + 1] - boundaries[i]) / (max - min)) * 100;
          return (
            <div
              key={i}
              className={`absolute inset-y-0 ${FILL[seg.tone]} ${i === 0 ? "rounded-l-lg" : ""} ${
                i === segments.length - 1 ? "rounded-r-lg" : ""
              }`}
              style={{ left: `${leftPct}%`, width: `${width}%` }}
            />
          );
        })}
        {values.map((v, i) => {
          const isActive = dragging === i;
          return (
            <div
              key={i}
              role="slider"
              tabIndex={0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={v}
              aria-label={`${segments[i].label} → ${segments[i + 1].label} boundary`}
              className={`absolute top-1/2 z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-primary ${
                isActive ? "scale-110 cursor-grabbing" : "cursor-grab hover:scale-105"
              }`}
              style={{ left: `${pctOf(v)}%` }}
              onPointerDown={onPointerDown(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  nudge(i, -step);
                  e.preventDefault();
                } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  nudge(i, step);
                  e.preventDefault();
                } else if (e.key === "Home") {
                  const next = [...values];
                  next[i] = clampThumb(i, min);
                  onChange(next);
                  e.preventDefault();
                } else if (e.key === "End") {
                  const next = [...values];
                  next[i] = clampThumb(i, max);
                  onChange(next);
                  e.preventDefault();
                }
              }}
            />
          );
        })}
      </div>

      {/* Boundary value read-outs under each thumb */}
      <div className="relative h-5">
        {values.map((v, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] font-bold font-mono tabular-nums"
            style={{ left: `${pctOf(v)}%` }}
          >
            {formatValue(v, step)} {suffix}
          </div>
        ))}
      </div>
    </div>
  );
}

function clampToRange(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function formatValue(v: number, step: number): string {
  // Show decimals only when the step requires them.
  if (step < 1) return v.toFixed(1);
  return Math.round(v).toString();
}
