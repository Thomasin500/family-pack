"use client";

import { useRemoveFromPack } from "@/hooks/use-trip-pack-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayWeight, bodyWeightPercent } from "@/lib/weight";
import type { DisplayUnit } from "@/lib/weight";
import { getCarryWarning } from "@/lib/carry-warnings";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useUpdatePackItem } from "@/hooks/use-trip-pack-items";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadoutModal } from "./loadout-modal";
import { X, Backpack, ChevronDown, ChevronRight, Plus } from "lucide-react";
import dynamic from "next/dynamic";

const AddToPackDialog = dynamic(
  () => import("./add-to-pack-dialog").then((m) => m.AddToPackDialog),
  { ssr: false }
);
import { useState } from "react";
import { toast } from "sonner";

interface PackColumnProps {
  pack: any;
  categories: any[];
  tripId: string;
  checklistMode?: boolean;
  allPacks?: any[];
}

export function PackColumn({ pack, tripId, checklistMode = false, allPacks }: PackColumnProps) {
  const removeFromPack = useRemoveFromPack(tripId);
  const updatePackItem = useUpdatePackItem(tripId);
  const { unit } = useWeightUnit();
  const user = pack.user;
  const packItems: any[] = pack.packItems ?? [];

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

  const sortedCategories = Array.from(categoryMap.values()).sort(
    (a, b) => (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0)
  );

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
    <div className="flex flex-col rounded-xl bg-card border border-outline-variant/10">
      {/* Person Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="text-outline">
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-primary-container/20 text-primary text-xs font-bold">
          {user?.role === "pet" ? "🐾" : (user?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold truncate">{user?.name}&apos;s Pack</h2>
          {collapsed && (
            <p className="text-xs text-outline font-mono tabular-nums">
              {displayWeight(totalCarried, unit)} &bull; {packItems.length} items
            </p>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setAddDialogOpen(true)}
            title="Add gear to pack"
            className="text-outline hover:text-primary"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setLoadoutOpen(true)}
            title="View loadout"
            className="text-outline hover:text-primary"
          >
            <Backpack className="size-3.5" />
          </Button>
          {checklistMode && packItems.length > 0 && (
            <Badge variant="default">
              {checkedCount}/{packItems.length}
            </Badge>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Checklist progress bar */}
          {checklistMode && packItems.length > 0 && (
            <div className="px-4 py-2">
              <div className="h-1.5 w-full rounded-full bg-surface-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(checkedCount / packItems.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Items by Category */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {packItems.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/10 py-12 gap-3">
                <span className="text-xs font-bold text-outline uppercase tracking-widest">
                  No gear yet
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddDialogOpen(true)}
                  className="text-xs"
                >
                  <Plus className="size-3" />
                  Add Gear
                </Button>
              </div>
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

          {/* Weight Summary Footer */}
          <div className="grid grid-cols-2 gap-2 p-3 border-t border-outline-variant/10">
            <div className="rounded-lg bg-surface-low p-3">
              <div className="text-[10px] font-bold uppercase text-outline">Base Weight</div>
              <div className="text-lg font-extrabold tabular-nums">
                {displayWeight(baseWeight, unit)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-low p-3">
              <div className="text-[10px] font-bold uppercase text-outline">Total Carried</div>
              <div className="text-lg font-extrabold tabular-nums">
                {displayWeight(totalCarried, unit)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-low p-3">
              <div className="text-[10px] font-bold uppercase text-outline">Skin-Out</div>
              <div className="text-lg font-extrabold tabular-nums">
                {displayWeight(skinOut, unit)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-low p-3">
              <div className="text-[10px] font-bold uppercase text-outline">% Body Wt</div>
              {user?.bodyWeightKg && user.bodyWeightKg > 0 ? (
                (() => {
                  const percent = bodyWeightPercent(totalCarried, user.bodyWeightKg);
                  const warning = getCarryWarning(percent, user.role ?? "adult");
                  return (
                    <div className={`text-lg font-extrabold tabular-nums ${warning.color}`}>
                      {percent.toFixed(1)}%
                    </div>
                  );
                })()
              ) : (
                <div className="text-lg font-extrabold tabular-nums text-outline">--</div>
              )}
            </div>
          </div>
        </>
      )}

      <LoadoutModal open={loadoutOpen} onOpenChange={setLoadoutOpen} pack={pack} />
      <AddToPackDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        tripId={tripId}
        packId={pack.id}
        packs={allPacks ?? [pack]}
        onChangePackId={() => {}}
      />
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
  unit: DisplayUnit;
}) {
  return (
    <div
      className="rounded-lg bg-surface-low p-3 border-l-4"
      style={{ borderLeftColor: category.color ?? "#6b7280" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
        {category.name}
      </p>
      <div className="space-y-1">
        {items.map((pi: any) => {
          const item = pi.item;
          if (!item) return null;
          const isWorn = pi.isWornOverride ?? item.isWorn ?? false;
          const isConsumable = pi.isConsumableOverride ?? item.isConsumable ?? false;
          const isShared = item.ownerType === "shared";
          const weight = (item.weightGrams ?? 0) * (pi.quantity ?? 1);

          return (
            <div
              key={pi.id}
              className={`flex items-center gap-2 group rounded-lg p-1.5 hover:bg-surface-bright transition-colors ${
                checklistMode && pi.isChecked ? "opacity-40" : ""
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
                className={`text-sm font-medium truncate flex-1 min-w-0 ${
                  checklistMode && pi.isChecked ? "line-through" : ""
                }`}
              >
                {item.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {isShared && <Badge variant="secondary">Shared</Badge>}
                {isWorn && <Badge variant="default">Worn</Badge>}
                {isConsumable && <Badge variant="outline">C</Badge>}
                <span className="text-xs font-mono tabular-nums text-on-surface-variant w-16 text-right">
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
