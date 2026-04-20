"use client";

import { useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpDown,
  ArrowUpWideNarrow,
  Check,
  GripVertical,
  Shirt,
} from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

export type SortMode =
  | "type"
  | "type-desc"
  | "name"
  | "name-desc"
  | "weight-asc"
  | "weight-desc"
  | "manual";

const OPTIONS: { value: SortMode; label: string; Icon: typeof Shirt }[] = [
  { value: "type", label: "Worn → Carried → Consumable", Icon: Shirt },
  { value: "type-desc", label: "Consumable → Carried → Worn", Icon: Shirt },
  { value: "name", label: "Name A → Z", Icon: ArrowDownAZ },
  { value: "name-desc", label: "Name Z → A", Icon: ArrowUpAZ },
  { value: "weight-asc", label: "Weight, light → heavy", Icon: ArrowUpWideNarrow },
  { value: "weight-desc", label: "Weight, heavy → light", Icon: ArrowDownWideNarrow },
  { value: "manual", label: "Manual order (drag to arrange)", Icon: GripVertical },
];

export function CategorySortMenu({
  value,
  onChange,
  className = "",
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  const CurrentIcon = current.Icon;
  const active = value !== "type";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors hover:bg-surface-high ${
          active ? "text-primary" : "text-outline"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={`Sort by: ${current.label}`}
        aria-label={`Sort by: ${current.label}`}
      >
        <ArrowUpDown className="size-3.5" />
        <span>Sort by:</span>
        <CurrentIcon className="size-3.5" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 min-w-[200px] rounded-lg border border-outline-variant/20 bg-card shadow-lg p-1"
          onClick={(e) => e.stopPropagation()}
        >
          {OPTIONS.map((opt) => {
            const OptionIcon = opt.Icon;
            const isCurrent = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-high ${
                  isCurrent ? "bg-surface-high font-bold" : ""
                }`}
              >
                <OptionIcon className="size-3.5 text-outline shrink-0" />
                <span className="flex-1">{opt.label}</span>
                {isCurrent && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 0 = worn, 1 = carried (default), 2 = consumable. */
function typeRank(item: { isWorn?: boolean | null; isConsumable?: boolean | null }): number {
  if (item.isWorn) return 0;
  if (item.isConsumable) return 2;
  return 1;
}

export function sortItems<
  T extends {
    name: string;
    weightGrams?: number;
    isWorn?: boolean | null;
    isConsumable?: boolean | null;
    sortOrder?: number;
  },
>(items: T[], mode: SortMode): T[] {
  const copy = [...items];
  if (mode === "manual") {
    // Sort by explicit sortOrder; stable fallback to name.
    copy.sort((a, b) => {
      const ra = a.sortOrder ?? 0;
      const rb = b.sortOrder ?? 0;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }
  if (mode === "type") {
    copy.sort((a, b) => {
      const r = typeRank(a) - typeRank(b);
      if (r !== 0) return r;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }
  if (mode === "type-desc") {
    copy.sort((a, b) => {
      const r = typeRank(b) - typeRank(a);
      if (r !== 0) return r;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }
  if (mode === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else if (mode === "name-desc") copy.sort((a, b) => b.name.localeCompare(a.name));
  else if (mode === "weight-asc") copy.sort((a, b) => (a.weightGrams ?? 0) - (b.weightGrams ?? 0));
  else if (mode === "weight-desc") copy.sort((a, b) => (b.weightGrams ?? 0) - (a.weightGrams ?? 0));
  return copy;
}
