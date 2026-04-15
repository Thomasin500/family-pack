"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { PACK_ZONES, getZoneForItem } from "@/lib/pack-zones";

interface LoadoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack: any;
}

interface ZoneGroup {
  zone: (typeof PACK_ZONES)[number];
  items: any[];
  totalGrams: number;
}

export function LoadoutModal({ open, onOpenChange, pack }: LoadoutModalProps) {
  const { unit } = useWeightUnit();
  const user = pack?.user;
  const packItems: any[] = pack?.packItems ?? [];

  // Group items by zone
  const zoneMap = new Map<string, any[]>();
  for (const pi of packItems) {
    const item = pi.item;
    if (!item) continue;

    const isWorn = pi.isWornOverride ?? item.isWorn ?? false;
    const categoryName = item.category?.name;
    const zoneId = getZoneForItem(categoryName, isWorn);

    if (!zoneMap.has(zoneId)) {
      zoneMap.set(zoneId, []);
    }
    zoneMap.get(zoneId)!.push(pi);
  }

  // Build sorted zone groups
  const zoneGroups: ZoneGroup[] = PACK_ZONES
    .map((zone) => {
      const items = zoneMap.get(zone.id) ?? [];
      const totalGrams = items.reduce((sum: number, pi: any) => {
        return sum + (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1);
      }, 0);
      return { zone, items, totalGrams };
    })
    .filter((g) => g.items.length > 0);

  // Also check for "separate" zone (pet gear)
  const separateItems = zoneMap.get("separate") ?? [];
  const separateGrams = separateItems.reduce((sum: number, pi: any) => {
    return sum + (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1);
  }, 0);

  const totalGrams = packItems.reduce((sum: number, pi: any) => {
    return sum + (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user?.name}&apos;s Loadout
            <span className="text-sm font-normal text-muted-foreground">
              {displayWeight(totalGrams, unit)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          {zoneGroups.map(({ zone, items, totalGrams: zoneWeight }) => (
            <ZoneSection
              key={zone.id}
              zone={zone}
              items={items}
              totalGrams={zoneWeight}
              unit={unit}
            />
          ))}

          {separateItems.length > 0 && (
            <ZoneSection
              zone={{
                id: "separate",
                label: "Pet Pack (Separate)",
                description: "Carried by pet",
                order: 99,
              }}
              items={separateItems}
              totalGrams={separateGrams}
              unit={unit}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ZoneSection({
  zone,
  items,
  totalGrams,
  unit,
}: {
  zone: { id: string; label: string; description: string };
  items: any[];
  totalGrams: number;
  unit: "imperial" | "metric";
}) {
  const zoneColors: Record<string, string> = {
    brain: "border-l-violet-500",
    "main-top": "border-l-blue-500",
    "side-pockets": "border-l-cyan-500",
    "main-middle": "border-l-amber-500",
    "main-bottom": "border-l-orange-500",
    external: "border-l-red-500",
    worn: "border-l-green-500",
    separate: "border-l-purple-500",
  };

  return (
    <div
      className={`border-l-4 rounded-r-lg bg-muted/20 px-3 py-2 ${
        zoneColors[zone.id] ?? "border-l-gray-400"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider">
            {zone.label}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {zone.description}
          </span>
        </div>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">
          {displayWeight(totalGrams, unit)}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((pi: any) => {
          const item = pi.item;
          if (!item) return null;
          const weight = (item.weightGrams ?? 0) * (pi.quantity ?? 1);
          const isShared = item.ownerType === "shared";

          return (
            <div key={pi.id} className="flex items-center gap-2 py-0.5">
              <span className="text-sm truncate flex-1 min-w-0">
                {item.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {pi.quantity > 1 && (
                  <span className="text-xs text-muted-foreground">
                    x{pi.quantity}
                  </span>
                )}
                {isShared && (
                  <Badge
                    variant="outline"
                    className="px-1 py-0 text-[10px] leading-tight"
                  >
                    &#9733;
                  </Badge>
                )}
                <span className="text-xs font-mono tabular-nums text-muted-foreground w-16 text-right">
                  {displayWeight(weight, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
