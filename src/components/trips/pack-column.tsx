"use client";

import { useRemoveFromPack } from "@/hooks/use-trip-pack-items";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayWeight, bodyWeightPercent } from "@/lib/weight";
import { getCarryWarning } from "@/lib/carry-warnings";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useUpdatePackItem } from "@/hooks/use-trip-pack-items";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadoutModal } from "./loadout-modal";
import { X, Backpack } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PackColumnProps {
  pack: any;
  categories: any[];
  tripId: string;
  checklistMode?: boolean;
}

export function PackColumn({ pack, categories, tripId, checklistMode = false }: PackColumnProps) {
  const removeFromPack = useRemoveFromPack(tripId);
  const updatePackItem = useUpdatePackItem(tripId);
  const { unit } = useWeightUnit();
  const user = pack.user;
  const packItems: any[] = pack.packItems ?? [];

  // Group items by category
  const categoryMap = new Map<string, { category: any; items: any[] }>();
  const uncategorized: any[] = [];

  for (const pi of packItems) {
    const item = pi.item;
    if (!item) continue;
    const catId = item.categoryId ?? item.category?.id;
    if (catId && item.category) {
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { category: item.category, items: [] });
      }
      categoryMap.get(catId)!.items.push(pi);
    } else {
      uncategorized.push(pi);
    }
  }

  // Sort categories by sortOrder
  const sortedCategories = Array.from(categoryMap.values()).sort(
    (a, b) => (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0)
  );

  // Weight calculations
  let baseWeight = 0;
  let totalCarried = 0;
  let skinOut = 0;

  for (const pi of packItems) {
    const w = (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1);
    const isWorn = pi.isWornOverride ?? pi.item?.isWorn ?? false;
    const isConsumable = pi.isConsumableOverride ?? pi.item?.isConsumable ?? false;

    skinOut += w;

    if (isWorn) {
      // Worn items are not in the pack
    } else {
      totalCarried += w;
      if (!isConsumable) {
        baseWeight += w;
      }
    }
  }

  const [loadoutOpen, setLoadoutOpen] = useState(false);
  const checkedCount = packItems.filter((pi: any) => pi.isChecked).length;

  function handleRemove(packItemId: string, itemName: string) {
    toast(`Remove "${itemName}" from pack?`, {
      action: {
        label: "Remove",
        onClick: () => removeFromPack.mutate({ packId: pack.id, itemId: packItemId }),
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  function handleToggleChecked(packItemId: string, checked: boolean) {
    updatePackItem.mutate({ packId: pack.id, itemId: packItemId, isChecked: checked });
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
      {/* Person Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Avatar className="size-8">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
          <AvatarFallback className="text-xs">
            {(user?.name ?? "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setLoadoutOpen(true)}
            title="View loadout"
          >
            <Backpack className="size-3.5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            {checklistMode
              ? `${checkedCount}/${packItems.length} packed`
              : `${packItems.length} ${packItems.length === 1 ? "item" : "items"}`}
          </p>
        </div>
      </div>
      {checklistMode && packItems.length > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${(checkedCount / packItems.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Items by Category */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {packItems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No gear added yet</p>
        )}

        {sortedCategories.map(({ category, items }) => (
          <CategoryGroup
            key={category.id}
            category={category}
            items={items}
            onRemove={handleRemove}
            checklistMode={checklistMode}
            onToggleChecked={handleToggleChecked}
            unit={unit}
          />
        ))}

        {uncategorized.length > 0 && (
          <CategoryGroup
            category={{ name: "Uncategorized", color: "#9ca3af" }}
            items={uncategorized}
            onRemove={handleRemove}
            checklistMode={checklistMode}
            onToggleChecked={handleToggleChecked}
            unit={unit}
          />
        )}
      </div>

      {/* Weight Summary */}
      <div className="border-t px-4 py-2.5 space-y-1 bg-muted/30">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Base weight</span>
          <span className="font-mono tabular-nums">{displayWeight(baseWeight, unit)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total carried</span>
          <span className="font-mono tabular-nums">{displayWeight(totalCarried, unit)}</span>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span>Skin-out</span>
          <span className="font-mono tabular-nums">{displayWeight(skinOut, unit)}</span>
        </div>
        {user?.bodyWeightKg &&
          user.bodyWeightKg > 0 &&
          (() => {
            const percent = bodyWeightPercent(totalCarried, user.bodyWeightKg);
            const warning = getCarryWarning(percent, user.role ?? "adult");
            return (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">% body weight</span>
                <span className={`font-mono tabular-nums font-medium ${warning.color}`}>
                  {percent.toFixed(1)}% · {warning.label}
                </span>
              </div>
            );
          })()}
      </div>

      <LoadoutModal open={loadoutOpen} onOpenChange={setLoadoutOpen} pack={pack} />
    </div>
  );
}

function CategoryGroup({
  category,
  items,
  onRemove,
  checklistMode,
  onToggleChecked,
  unit,
}: {
  category: any;
  items: any[];
  onRemove: (packItemId: string, itemName: string) => void;
  checklistMode: boolean;
  onToggleChecked: (packItemId: string, checked: boolean) => void;
  unit: "imperial" | "metric";
}) {
  return (
    <div
      className="border-l-4 rounded-r-md pl-2.5 py-1"
      style={{ borderLeftColor: category.color ?? "#6b7280" }}
    >
      <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1.5">
        <span
          className="size-2 rounded-full inline-block"
          style={{ backgroundColor: category.color ?? "#6b7280" }}
        />
        {category.name}
      </p>
      <div className="space-y-0.5">
        {items.map((pi: any) => {
          const item = pi.item;
          if (!item) return null;
          const isWorn = pi.isWornOverride ?? item.isWorn ?? false;
          const isConsumable = pi.isConsumableOverride ?? item.isConsumable ?? false;
          const isShared = item.ownerType === "shared";
          const isBorrowed = pi.isBorrowed ?? false;
          const weight = (item.weightGrams ?? 0) * (pi.quantity ?? 1);

          return (
            <div
              key={pi.id}
              className={`flex items-center gap-1.5 group py-0.5 pr-1 ${
                checklistMode && pi.isChecked ? "opacity-50" : ""
              }`}
            >
              {checklistMode && (
                <Checkbox
                  checked={pi.isChecked ?? false}
                  onCheckedChange={(checked) => onToggleChecked(pi.id, checked === true)}
                  className="shrink-0"
                />
              )}
              <span
                className={`text-sm truncate flex-1 min-w-0 ${
                  checklistMode && pi.isChecked ? "line-through" : ""
                }`}
              >
                {item.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {pi.quantity > 1 && (
                  <span className="text-xs text-muted-foreground">x{pi.quantity}</span>
                )}
                {isWorn && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] leading-tight">
                    W
                  </Badge>
                )}
                {isConsumable && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] leading-tight">
                    C
                  </Badge>
                )}
                {isShared && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] leading-tight">
                    &#9733;
                  </Badge>
                )}
                {isBorrowed && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] leading-tight">
                    &#8593;
                  </Badge>
                )}
                <span className="text-xs font-mono tabular-nums text-muted-foreground w-16 text-right">
                  {displayWeight(weight, unit)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(pi.id, item.name)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
