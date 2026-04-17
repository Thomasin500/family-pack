"use client";

import { useRemoveFromPack } from "@/hooks/use-trip-pack-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayWeight, bodyWeightPercent } from "@/lib/weight";
import type { DisplayUnit } from "@/lib/weight";
import { getCarryWarning } from "@/lib/carry-warnings";
import { resolveSettings } from "@/lib/household-settings";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useHousehold } from "@/hooks/use-household";
import { useUpdatePackItem } from "@/hooks/use-trip-pack-items";
import type { HouseholdSettings } from "@/db/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadoutModal } from "./loadout-modal";
import {
  X,
  Backpack,
  ChevronDown,
  ChevronRight,
  Plus,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react";
import { CategorySortMenu, sortItems, type SortMode } from "@/components/ui/sort-menu";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  const { data: householdData } = useHousehold();
  const householdSettings = householdData?.household?.settings as HouseholdSettings | null;
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
  const [sortModes, setSortModes] = useState<Record<string, SortMode>>({});
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const checkedCount = packItems.filter((pi: any) => pi.isChecked).length;

  function toggleCategoryCollapsed(catId: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  const categoryIds = [
    ...sortedCategories.map(({ category }) => category.id),
    ...(uncategorized.length > 0 ? ["__uncategorized"] : []),
  ];
  const allCategoriesCollapsed =
    categoryIds.length > 0 && categoryIds.every((id) => collapsedCats.has(id));
  function toggleCollapseAll() {
    setCollapsedCats(allCategoriesCollapsed ? new Set() : new Set(categoryIds));
  }

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

  const statsFooter = (
    <div className="grid grid-cols-2 gap-2 p-3">
      <div className="rounded-lg bg-surface-low p-3">
        <div className="text-[10px] font-bold uppercase text-outline">Base Weight</div>
        <div className="text-lg font-extrabold tabular-nums">{displayWeight(baseWeight, unit)}</div>
      </div>
      <div className="rounded-lg bg-surface-low p-3">
        <div className="text-[10px] font-bold uppercase text-outline">Total Carried</div>
        <div className="text-lg font-extrabold tabular-nums">
          {displayWeight(totalCarried, unit)}
        </div>
      </div>
      <div className="rounded-lg bg-surface-low p-3">
        <div className="text-[10px] font-bold uppercase text-outline">Skin-Out</div>
        <div className="text-lg font-extrabold tabular-nums">{displayWeight(skinOut, unit)}</div>
      </div>
      <div className="rounded-lg bg-surface-low p-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase text-outline">% Body Wt</div>
          {user?.bodyWeightKg && user.bodyWeightKg > 0 && (
            <CarryScaleLegend role={user.role ?? "adult"} settings={householdSettings} />
          )}
        </div>
        {user?.bodyWeightKg && user.bodyWeightKg > 0 ? (
          (() => {
            const percent = bodyWeightPercent(totalCarried, user.bodyWeightKg);
            const warning = getCarryWarning(percent, user.role ?? "adult", householdSettings);
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
  );

  return (
    <PackColumnDropZone packId={pack.id} collapsed={collapsed}>
      {/* Person Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
          collapsed ? "rounded-t-xl bg-surface-low" : "border-b border-outline-variant/10"
        }`}
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
          <span className="text-xs text-outline">
            {packItems.length} {packItems.length === 1 ? "item" : "items"}
          </span>
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
            {categoryIds.length > 0 && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={toggleCollapseAll}
                title={allCategoriesCollapsed ? "Expand all categories" : "Collapse all categories"}
                className="text-outline hover:text-primary"
              >
                <ChevronsUpDown className="size-3.5" />
              </Button>
            )}
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

      {/* Collapsed: show just the stats bar (no categories, no grey card frame) */}
      {collapsed && <div className="rounded-b-xl bg-surface-low">{statsFooter}</div>}

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
                sortMode={sortModes[category.id] ?? "manual"}
                onChangeSort={(mode) => setSortModes((prev) => ({ ...prev, [category.id]: mode }))}
                collapsed={collapsedCats.has(category.id)}
                onToggleCollapsed={() => toggleCategoryCollapsed(category.id)}
              />
            ))}

            {uncategorized.length > 0 && (
              <CategoryGroup
                category={{ id: "__uncategorized", name: "Uncategorized", color: "#9ca3af" }}
                items={uncategorized}
                onRemove={handleRemove}
                checklistMode={checklistMode}
                onToggleChecked={handleToggleChecked}
                unit={unit}
                sortMode={sortModes["__uncategorized"] ?? "manual"}
                onChangeSort={(mode) =>
                  setSortModes((prev) => ({ ...prev, __uncategorized: mode }))
                }
                collapsed={collapsedCats.has("__uncategorized")}
                onToggleCollapsed={() => toggleCategoryCollapsed("__uncategorized")}
              />
            )}
          </div>

          {/* Weight Summary Footer — same block reused in collapsed state */}
          <div className="border-t border-outline-variant/10">{statsFooter}</div>
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
    </PackColumnDropZone>
  );
}

/**
 * Outer wrapper for a pack that also functions as a dnd-kit drop target.
 * Dragging a pool chip or another pack's item onto this zone highlights it;
 * the workspace-level onDragEnd handles the actual mutation.
 */
function PackColumnDropZone({
  packId,
  collapsed,
  children,
}: {
  packId: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `pack:${packId}`,
    data: { type: "pack", packId },
  });
  return (
    <div
      ref={setNodeRef}
      data-pack-id={packId}
      className={`flex flex-col transition-colors ${
        collapsed ? "rounded-xl" : "rounded-xl bg-card border"
      } ${isOver ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/10"}`}
    >
      {children}
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
  sortMode,
  onChangeSort,
  collapsed,
  onToggleCollapsed,
}: {
  category: any;
  items: any[];
  onRemove: (packItemId: string, itemName: string) => void;
  checklistMode: boolean;
  onToggleChecked: (packItemId: string, checked: boolean) => void;
  unit: DisplayUnit;
  sortMode: SortMode;
  onChangeSort: (mode: SortMode) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  // Project the trip pack item's effective fields (respecting overrides) so sort works.
  const sortable = items.map((pi: any) => ({
    pi,
    name: pi.item?.name ?? "",
    weightGrams: (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1),
    isWorn: pi.isWornOverride ?? pi.item?.isWorn ?? false,
    isConsumable: pi.isConsumableOverride ?? pi.item?.isConsumable ?? false,
    sortOrder: pi.sortOrder ?? 0,
  }));
  const sorted = sortItems(sortable, sortMode).map((s) => s.pi);
  const subtotal = items.reduce(
    (sum: number, pi: any) => sum + (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1),
    0
  );

  return (
    <div
      className="rounded-lg bg-surface-low p-3 border-l-4"
      style={{ borderLeftColor: category.color ?? "#6b7280" }}
    >
      <div className="mb-2 cursor-pointer select-none" onClick={onToggleCollapsed}>
        <div className="flex items-start gap-2">
          <span className="text-outline shrink-0 mt-0.5">
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
          <h3
            className="text-sm font-extrabold uppercase tracking-wider flex-1 min-w-0 break-words leading-tight"
            style={{ color: category.color ?? "inherit" }}
            title={category.name}
          >
            {category.name}
          </h3>
        </div>
        <div className="mt-1 pl-6 flex items-center gap-3">
          <span className="text-[10px] text-outline font-mono tabular-nums shrink-0">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <span className="text-xs font-bold font-mono tabular-nums text-on-surface-variant shrink-0">
            {displayWeight(subtotal, unit)}
          </span>
          {!collapsed && (
            <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-auto">
              <CategorySortMenu value={sortMode} onChange={onChangeSort} />
            </div>
          )}
        </div>
      </div>
      {!collapsed && (
        <SortableContext
          items={sorted.map((pi: any) => pi.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {sorted.map((pi: any) => (
              <SortablePackItemRow
                key={pi.id}
                pi={pi}
                unit={unit}
                checklistMode={checklistMode}
                onToggleChecked={onToggleChecked}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

/**
 * A pack item row that is both sortable (for intra-pack reorder) and
 * draggable across packs / to the pool. Drag handle on the left is
 * the only grip so touch scroll still works on mobile.
 */
export function SortablePackItemRow({
  pi,
  unit,
  checklistMode,
  onToggleChecked,
  onRemove,
  asOverlay = false,
}: {
  pi: any;
  unit: DisplayUnit;
  checklistMode: boolean;
  onToggleChecked: (packItemId: string, checked: boolean) => void;
  onRemove: (packItemId: string, itemName: string) => void;
  /** Non-interactive clone used inside DragOverlay. */
  asOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pi.id,
    data: { type: "pack-item", tripPackItemId: pi.id, fromPackId: pi.tripPackId, pi },
    disabled: asOverlay || checklistMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !asOverlay ? 0.4 : 1,
  };

  const item = pi.item;
  if (!item) return null;
  const isWorn = pi.isWornOverride ?? item.isWorn ?? false;
  const isConsumable = pi.isConsumableOverride ?? item.isConsumable ?? false;
  const isShared = item.ownerType === "shared";
  const weight = (item.weightGrams ?? 0) * (pi.quantity ?? 1);
  const qty = pi.quantity ?? 1;

  return (
    <div
      ref={asOverlay ? undefined : setNodeRef}
      style={asOverlay ? undefined : style}
      className={`flex items-center gap-2 group rounded-lg p-1.5 hover:bg-surface-bright transition-colors ${
        checklistMode && pi.isChecked ? "opacity-40" : ""
      } ${asOverlay ? "bg-card shadow-lg border border-primary/40" : ""}`}
    >
      {!checklistMode && !asOverlay && (
        <button
          type="button"
          className="shrink-0 text-outline/40 hover:text-primary cursor-grab active:cursor-grabbing opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-none"
          {...listeners}
          {...attributes}
          aria-label="Drag to reorder or move between packs"
          title="Drag to reorder or move between packs"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      {checklistMode && (
        <Checkbox
          checked={pi.isChecked ?? false}
          onCheckedChange={(checked) => onToggleChecked(pi.id, checked === true)}
          className="shrink-0"
        />
      )}
      <span
        className={`text-sm font-medium flex-1 min-w-0 break-words ${
          checklistMode && pi.isChecked ? "line-through" : ""
        }`}
        title={item.name}
      >
        {item.name}
        {qty > 1 && <span className="ml-1 text-outline font-mono">×{qty}</span>}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {isShared && <Badge variant="secondary">Shared</Badge>}
        {isWorn && <Badge variant="default">Worn</Badge>}
        {isConsumable && <Badge variant="outline">C</Badge>}
      </div>
      <span className="text-sm font-mono tabular-nums text-on-surface-variant w-20 text-right shrink-0">
        {displayWeight(weight, unit)}
      </span>
      {!asOverlay && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={() => onRemove(pi.id, item.name)}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}

function CarryScaleLegend({
  role,
  settings,
}: {
  role: "adult" | "child" | "pet";
  settings: HouseholdSettings | null;
}) {
  const resolved = resolveSettings(settings);
  const cfg = role === "pet" ? resolved.petCarryPercent : resolved.humanCarryPercent;
  const tiers = [
    { label: "Comfortable", max: `< ${cfg.ok}%`, color: "bg-green-500" },
    { label: "OK", max: `${cfg.ok}–${cfg.warn}%`, color: "bg-yellow-500" },
    { label: "Warn", max: `${cfg.warn}–${cfg.max}%`, color: "bg-orange-500" },
    { label: "Overloaded", max: `≥ ${cfg.max}%`, color: "bg-red-500" },
  ];
  return (
    <div className="group relative">
      <div
        className="flex h-1.5 w-12 overflow-hidden rounded-full cursor-help"
        aria-label="Carry weight color scale"
      >
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-yellow-500" />
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-red-500" />
      </div>
      <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 hidden min-w-40 rounded-md border border-outline-variant/20 bg-popover p-2 text-[10px] shadow-md group-hover:block">
        <div className="mb-1 font-bold uppercase tracking-wider text-outline">Body-wt tiers</div>
        {tiers.map((t) => (
          <div key={t.label} className="flex items-center gap-2 py-0.5">
            <span className={`inline-block size-2 rounded-full ${t.color}`} />
            <span className="flex-1">{t.label}</span>
            <span className="font-mono tabular-nums text-outline">{t.max}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
