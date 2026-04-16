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
import { useConfirm } from "@/components/providers/confirm-provider";

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
  const confirm = useConfirm();
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

  async function handleRemove(packItemId: string, itemName: string) {
    const ok = await confirm({
      title: `Remove "${itemName}" from pack?`,
      description: "The item stays in your closet — it's just removed from this trip.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) removeFromPack.mutate({ packId: pack.id, itemId: packItemId });
  }

  function handleToggleChecked(packItemId: string, checked: boolean) {
    updatePackItem.mutate({ packId: pack.id, itemId: packItemId, isChecked: checked });
  }

  const [collapsedUnit, setCollapsedUnit] = useState<"lb" | "oz" | "kg" | "g">("lb");

  function cycleCollapsedUnit() {
    setCollapsedUnit((prev) => {
      const order: Array<"lb" | "oz" | "kg" | "g"> = ["lb", "oz", "kg", "g"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }

  function formatCollapsedWeight(grams: number): string {
    switch (collapsedUnit) {
      case "lb":
        return (grams / 453.592).toFixed(1) + " lb";
      case "oz":
        return (grams / 28.3495).toFixed(1) + " oz";
      case "kg":
        return (grams / 1000).toFixed(1) + " kg";
      case "g":
        return grams + " g";
    }
  }

  return (
    <div
      className={`flex flex-col rounded-xl bg-card border border-outline-variant/10 ${collapsed ? "!border-transparent" : ""}`}
    >
      {/* Person Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${collapsed ? "rounded-xl bg-surface-low" : "border-b border-outline-variant/10"}`}
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
        </div>
        {collapsed ? (
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="font-mono text-sm font-bold tabular-nums text-on-surface-variant hover:text-primary transition-colors"
              onClick={cycleCollapsedUnit}
              title="Click to change unit"
            >
              {formatCollapsedWeight(totalCarried)}
            </button>
            <span className="text-xs text-outline">{packItems.length} items</span>
          </div>
        ) : (
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
        )}
      </div>

      {!collapsed && (
        <>
          {/* Checklist progress bar — segmented by category */}
          {checklistMode &&
            packItems.length > 0 &&
            (() => {
              const pct = Math.round((checkedCount / packItems.length) * 100);
              // Build per-category segments
              const segments: { color: string; total: number; checked: number }[] = [];
              for (const { category, items: catItems } of sortedCategories) {
                const total = catItems.length;
                const checked = catItems.filter((pi: any) => pi.isChecked).length;
                segments.push({ color: category.color ?? "#6b7280", total, checked });
              }
              if (uncategorized.length > 0) {
                const checked = uncategorized.filter((pi: any) => pi.isChecked).length;
                segments.push({ color: "#9ca3af", total: uncategorized.length, checked });
              }
              return (
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                      Packing Progress
                    </span>
                    <span className="text-xs font-bold tabular-nums text-primary">{pct}%</span>
                  </div>
                  <div className="flex h-2 w-full rounded-full overflow-hidden bg-surface-high gap-px">
                    {segments.map((seg, i) => {
                      const widthPct = (seg.total / packItems.length) * 100;
                      const fillPct = seg.total > 0 ? (seg.checked / seg.total) * 100 : 0;
                      return (
                        <div
                          key={i}
                          className="relative overflow-hidden transition-all duration-300"
                          style={{ width: `${widthPct}%`, backgroundColor: `${seg.color}22` }}
                        >
                          <div
                            className="absolute inset-y-0 left-0 transition-all duration-300"
                            style={{ width: `${fillPct}%`, backgroundColor: seg.color }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

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
        key={pack.id}
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
