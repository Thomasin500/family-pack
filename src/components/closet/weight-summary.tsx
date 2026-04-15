"use client";

import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { Badge } from "@/components/ui/badge";

interface Item {
  id: string;
  weightGrams: number;
  isWorn: boolean;
  isConsumable: boolean;
}

interface WeightSummaryProps {
  items: Item[];
}

export function WeightSummary({ items }: WeightSummaryProps) {
  const { unit } = useWeightUnit();
  const baseWeight = items
    .filter((i) => !i.isWorn && !i.isConsumable)
    .reduce((sum, i) => sum + (i.weightGrams ?? 0), 0);
  const wornWeight = items
    .filter((i) => i.isWorn)
    .reduce((sum, i) => sum + (i.weightGrams ?? 0), 0);
  const consumableWeight = items
    .filter((i) => i.isConsumable)
    .reduce((sum, i) => sum + (i.weightGrams ?? 0), 0);
  const totalCarried = baseWeight + consumableWeight;
  const skinOut = totalCarried + wornWeight;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/10 bg-surface-highest/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Base Weight
              </span>
              <span className="text-lg font-extrabold tabular-nums text-primary">
                {displayWeight(baseWeight, unit)}
              </span>
            </div>

            <div className="hidden h-8 w-px bg-outline-variant/20 md:block" />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Carried
              </span>
              <span className="text-lg font-extrabold tabular-nums">
                {displayWeight(totalCarried, unit)}
              </span>
            </div>

            <div className="hidden h-8 w-px bg-outline-variant/20 md:block" />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Skin-Out
              </span>
              <span className="text-lg font-extrabold tabular-nums">
                {displayWeight(skinOut, unit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
