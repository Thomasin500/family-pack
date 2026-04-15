"use client";

import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";

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
  const totalWeight = baseWeight + wornWeight + consumableWeight;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block size-2.5 rounded-full bg-foreground/70" />
        <span className="text-muted-foreground">Base</span>
        <span className="font-medium">
          {displayWeight(baseWeight, unit)}
        </span>
      </div>

      <div className="text-border">|</div>

      <div className="flex items-center gap-2">
        <span className="inline-block size-2.5 rounded-full bg-blue-500" />
        <span className="text-muted-foreground">Worn</span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {displayWeight(wornWeight, unit)}
        </span>
      </div>

      <div className="text-border">|</div>

      <div className="flex items-center gap-2">
        <span className="inline-block size-2.5 rounded-full bg-amber-500" />
        <span className="text-muted-foreground">Consumable</span>
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {displayWeight(consumableWeight, unit)}
        </span>
      </div>

      <div className="text-border">|</div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold">
          {displayWeight(totalWeight, unit)}
        </span>
      </div>
    </div>
  );
}
