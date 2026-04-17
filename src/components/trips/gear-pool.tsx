"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Shirt,
  Flame,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySortMenu, sortItems, type SortMode } from "@/components/ui/sort-menu";
import { useBumpPackItem } from "@/hooks/use-trip-pack-items";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useClickOutside } from "@/hooks/use-click-outside";
import { displayWeight } from "@/lib/weight";
import type { Item, Category, TripPack } from "@/types";

interface GearPoolProps {
  /** Items eligible for the pool (already filtered upstream via filterPoolItems). */
  items: Item[];
  /** All items in the household — used when "show already packed" is on. */
  allItems?: Item[];
  packs: TripPack[];
  categories: Category[];
  members: { id: string; name: string | null; role?: string | null }[];
  householdId: string;
  tripId: string;
  /** Map of itemId → total quantity across all packs in this trip (for allowMultiple display). */
  packedQuantities?: Record<string, number>;
  /**
   * Whether to force-expand the pool regardless of internal state.
   * Used by drag-and-drop so drop targets are always visible.
   */
  forceExpanded?: boolean;
  /** Map of itemId → packId — for "in X's pack" badges on already-packed chips. */
  itemPackMap?: Record<string, { packId: string; packName: string }>;
}

/** Marker on the item model — real types for this land in M2. */
type PoolItem = Item & { allowMultiple?: boolean | null };

function ownerLabel(item: PoolItem, members: Props["members"], householdId: string): string {
  if (item.ownerType === "shared" || item.ownerId === householdId) return "Shared";
  const m = members.find((x) => x.id === item.ownerId);
  return m?.name ?? "Unknown";
}

type Props = GearPoolProps;

export function GearPool({
  items,
  allItems,
  packs,
  categories,
  members,
  householdId,
  tripId,
  packedQuantities = {},
  forceExpanded = false,
  itemPackMap = {},
}: GearPoolProps) {
  const bumpPackItem = useBumpPackItem(tripId);
  const { unit } = useWeightUnit();
  // The pool is a drop target (drag a pack item here to unassign / decrement).
  const { setNodeRef: setPoolDropRef, isOver: poolIsOver } = useDroppable({
    id: "pool",
    data: { type: "pool" },
  });

  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showWornOnly, setShowWornOnly] = useState(false);
  const [showConsumableOnly, setShowConsumableOnly] = useState(false);
  const [showAlreadyPacked, setShowAlreadyPacked] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("type");
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Global "/" to focus pool search (unless user is already typing somewhere).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && /INPUT|TEXTAREA|SELECT/.test(tgt.tagName)) return;
      if (tgt && tgt.isContentEditable) return;
      e.preventDefault();
      setExpanded(true);
      // Defer focus so the panel is rendered if it was collapsed.
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Unassigned shared is the nudge — always count regardless of filters.
  const unassignedSharedCount = items.filter(
    (it) => it.ownerType === "shared" && (packedQuantities[it.id] ?? 0) === 0
  ).length;

  // Any unassigned shared → auto-expand (unless user has collapsed it this session).
  const isOpen = forceExpanded || expanded || unassignedSharedCount > 0;

  // Effective pool source — includes already-packed items as a dimmed overlay
  // when the toggle is on. Deduped by id.
  const poolSource = useMemo(() => {
    if (!showAlreadyPacked || !allItems) return items;
    const seen = new Set(items.map((i) => i.id));
    const merged = [...items];
    for (const it of allItems) {
      if (!seen.has(it.id)) merged.push(it);
    }
    return merged;
  }, [items, allItems, showAlreadyPacked]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return poolSource.filter((it) => {
      if (ownerFilter === "shared") {
        if (it.ownerType !== "shared") return false;
      } else if (ownerFilter !== "all") {
        if (it.ownerType !== "personal" || it.ownerId !== ownerFilter) return false;
      }
      if (categoryFilter !== "all") {
        const catId = it.categoryId ?? it.category?.id ?? "__uncategorized";
        if (catId !== categoryFilter) return false;
      }
      if (showWornOnly && !it.isWorn) return false;
      if (showConsumableOnly && !it.isConsumable) return false;
      if (q) {
        const hay = `${it.name} ${it.brand ?? ""} ${it.model ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [poolSource, ownerFilter, categoryFilter, showWornOnly, showConsumableOnly, search]);

  // Group by category.
  const grouped = useMemo(() => {
    const map = new Map<string, { category: Category | null; items: PoolItem[] }>();
    for (const it of filtered) {
      const catId = it.categoryId ?? it.category?.id ?? "__uncategorized";
      if (!map.has(catId)) {
        const cat = it.category ?? categories.find((c) => c.id === catId) ?? null;
        map.set(catId, { category: cat, items: [] });
      }
      map.get(catId)!.items.push(it);
    }
    // Sort items within each group by the active sort mode; shared-unassigned
    // items still float to the top of their category for urgency.
    const entries = Array.from(map.values()).map((grp) => {
      const sorted = sortItems(grp.items, sortMode);
      sorted.sort((a, b) => {
        const aUnassigned = a.ownerType === "shared" && (packedQuantities[a.id] ?? 0) === 0 ? 1 : 0;
        const bUnassigned = b.ownerType === "shared" && (packedQuantities[b.id] ?? 0) === 0 ? 1 : 0;
        return bUnassigned - aUnassigned;
      });
      return { ...grp, items: sorted };
    });
    // Sort categories by their sortOrder, uncategorized last.
    entries.sort((a, b) => {
      if (!a.category) return 1;
      if (!b.category) return -1;
      return (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0);
    });
    return entries;
  }, [filtered, categories, sortMode, packedQuantities]);

  const hasActiveFilters =
    search !== "" ||
    ownerFilter !== "all" ||
    categoryFilter !== "all" ||
    showWornOnly ||
    showConsumableOnly ||
    showAlreadyPacked;

  function clearFilters() {
    setSearch("");
    setOwnerFilter("all");
    setCategoryFilter("all");
    setShowWornOnly(false);
    setShowConsumableOnly(false);
    setShowAlreadyPacked(false);
  }

  function assign(itemId: string, packId: string) {
    bumpPackItem.mutate({ packId, itemId });
    setOpenItemId(null);
  }

  // Collapsed: show a single-line summary that's still clickable and still
  // acts as a drop target so "drag here to unassign" works even when closed.
  if (!isOpen) {
    return (
      <button
        ref={setPoolDropRef}
        type="button"
        onClick={() => setExpanded(true)}
        className={`w-full rounded-xl border border-dashed px-4 py-3 text-left transition-colors ${
          poolIsOver
            ? "border-primary bg-primary/10"
            : "border-outline-variant/40 bg-surface-low hover:border-primary/40 hover:bg-primary/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <Package className="size-4 text-outline" />
          <span className="text-xs font-bold uppercase tracking-widest text-outline">
            Gear Pool · {items.length} available
          </span>
          <ChevronDown className="ml-auto size-4 text-outline" />
        </div>
      </button>
    );
  }

  return (
    <div
      ref={setPoolDropRef}
      className={`rounded-xl border bg-surface-low overflow-hidden transition-colors ${
        poolIsOver ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-outline-variant/10">
        <Package className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest">Gear Pool</span>
        <span className="text-xs text-outline">
          · {items.length} available
          {unassignedSharedCount > 0 && (
            <span className="ml-1 text-primary font-semibold">
              · {unassignedSharedCount} shared unassigned
            </span>
          )}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <CategorySortMenu value={sortMode} onChange={setSortMode} />
          {/* Only allow user-collapse when there's no urgent unassigned shared gear */}
          {unassignedSharedCount === 0 && !forceExpanded && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setExpanded(false)}
              aria-label="Collapse pool"
              title="Collapse pool"
            >
              <ChevronUp className="size-4 text-outline" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-outline-variant/10 bg-surface">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-outline pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search (press / to focus)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearch("");
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full h-7 pl-7 pr-2 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name ?? "Member"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setShowWornOnly((v) => !v)}
          aria-pressed={showWornOnly}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
            showWornOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-outline-variant/30 text-outline hover:text-foreground"
          }`}
          title="Show worn items only"
        >
          <Shirt className="size-3" />
          Worn
        </button>
        <button
          type="button"
          onClick={() => setShowConsumableOnly((v) => !v)}
          aria-pressed={showConsumableOnly}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
            showConsumableOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-outline-variant/30 text-outline hover:text-foreground"
          }`}
          title="Show consumables only"
        >
          <Flame className="size-3" />
          Consumable
        </button>
        {allItems && (
          <button
            type="button"
            onClick={() => setShowAlreadyPacked((v) => !v)}
            aria-pressed={showAlreadyPacked}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
              showAlreadyPacked
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant/30 text-outline hover:text-foreground"
            }`}
            title={
              showAlreadyPacked
                ? "Hide items already in a pack"
                : "Show items already in a pack (dimmed)"
            }
          >
            {showAlreadyPacked ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
            Packed
          </button>
        )}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearFilters}
            className="text-[11px]"
            title="Clear filters"
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[45vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-outline">
            {items.length === 0 ? (
              <>
                <div className="text-2xl mb-1">🎉</div>
                All gear assigned.
              </>
            ) : (
              <>No items match your filters.</>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant/10">
            {grouped.map((grp) => (
              <div key={grp.category?.id ?? "__uncategorized"} className="py-1.5">
                <div className="flex items-center gap-2 px-4 py-1">
                  {grp.category ? (
                    <>
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: grp.category.color }}
                        aria-hidden
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-outline">
                        {grp.category.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-outline">
                      Uncategorized
                    </span>
                  )}
                  <span className="text-[11px] text-outline/60">· {grp.items.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                  {grp.items.map((item) => {
                    const isOpen = openItemId === item.id;
                    if (isOpen) {
                      return (
                        <InlinePackPicker
                          key={item.id}
                          item={item}
                          packs={packs}
                          unit={unit}
                          onAssign={(packId) => assign(item.id, packId)}
                          onCancel={() => setOpenItemId(null)}
                        />
                      );
                    }
                    const packedQty = packedQuantities[item.id] ?? 0;
                    const isSharedUnassigned = item.ownerType === "shared" && packedQty === 0;
                    // "Already packed" = non-stackable item currently in a pack.
                    // Only shown when showAlreadyPacked is on (dimmed + non-draggable).
                    const isAlreadyPacked = packedQty > 0 && !item.allowMultiple;
                    if (isAlreadyPacked) {
                      const where = itemPackMap[item.id];
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (!where?.packId) return;
                            const el = document.querySelector(`[data-pack-id="${where.packId}"]`);
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border border-dashed border-outline-variant/30 bg-surface/40 text-outline/60 hover:text-foreground hover:border-outline-variant cursor-pointer transition-colors"
                          title={
                            where
                              ? `Already in ${where.packName}'s pack — click to scroll to it`
                              : "Already in a pack"
                          }
                        >
                          <span className="font-medium line-through decoration-outline-variant/40">
                            {item.name}
                          </span>
                          {where?.packName && (
                            <span className="text-[10px] uppercase tracking-wider">
                              in {where.packName}
                            </span>
                          )}
                          <span className="font-mono tabular-nums">
                            {displayWeight(item.weightGrams ?? 0, unit)}
                          </span>
                        </button>
                      );
                    }
                    return (
                      <PoolChip
                        key={item.id}
                        item={item}
                        ownerText={
                          item.ownerType === "shared"
                            ? "Shared"
                            : ownerLabel(item, members, householdId)
                        }
                        isSharedUnassigned={isSharedUnassigned}
                        packedQty={packedQty}
                        unit={unit}
                        onClick={() => {
                          if (packs.length === 1) {
                            assign(item.id, packs[0].id);
                          } else {
                            setOpenItemId(item.id);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PoolChip({
  item,
  ownerText,
  isSharedUnassigned,
  packedQty,
  unit,
  onClick,
  asOverlay = false,
}: {
  item: PoolItem;
  ownerText: string;
  isSharedUnassigned: boolean;
  packedQty: number;
  unit: ReturnType<typeof useWeightUnit>["unit"];
  onClick?: () => void;
  /** Render as a static (non-draggable) clone for the drag overlay. */
  asOverlay?: boolean;
}) {
  const isStackable = !!item.allowMultiple;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool:${item.id}`,
    data: { type: "pool-item", item },
    disabled: asOverlay,
  });
  const classes = `group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border transition-colors cursor-grab active:cursor-grabbing ${
    isSharedUnassigned
      ? "bg-primary/5 border-primary/40 hover:bg-primary/10 hover:border-primary"
      : "bg-card border-outline-variant/20 hover:border-primary/60 hover:bg-primary/5"
  } ${isDragging && !asOverlay ? "opacity-40" : ""}`;
  return (
    <button
      ref={asOverlay ? undefined : setNodeRef}
      type="button"
      {...(asOverlay ? {} : listeners)}
      {...(asOverlay ? {} : attributes)}
      onClick={(e) => {
        // Suppress click when a drag just completed.
        if (isDragging) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      className={classes}
      title={asOverlay ? undefined : "Drag onto a pack, or click to assign"}
    >
      <span className="font-medium">{item.name}</span>
      <span className="text-[10px] uppercase tracking-wider text-outline/70">{ownerText}</span>
      {isStackable && (
        <span
          className="inline-flex items-center gap-0.5 text-outline"
          title={
            packedQty > 0
              ? `${packedQty} already in packs — stays in pool`
              : "Stackable — stays in pool after assigning"
          }
        >
          <Layers className="size-3" />
          {packedQty > 0 && <span className="font-mono text-[10px]">×{packedQty}</span>}
        </span>
      )}
      <span className="text-outline font-mono tabular-nums">
        {displayWeight(item.weightGrams ?? 0, unit)}
      </span>
    </button>
  );
}

function InlinePackPicker({
  item,
  packs,
  unit,
  onAssign,
  onCancel,
}: {
  item: PoolItem;
  packs: TripPack[];
  unit: ReturnType<typeof useWeightUnit>["unit"];
  onAssign: (packId: string) => void;
  onCancel: () => void;
}) {
  const [packId, setPackId] = useState("");
  const ref = useClickOutside<HTMLDivElement>(onCancel);
  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-1.5 rounded-full bg-card pl-3 pr-1 py-1 text-xs border border-primary"
    >
      <span className="font-medium">{item.name}</span>
      <span className="text-outline font-mono tabular-nums">
        {displayWeight(item.weightGrams ?? 0, unit)}
      </span>
      <Select value={packId} onValueChange={setPackId}>
        <SelectTrigger className="h-6 w-28 text-xs">
          <SelectValue placeholder="Assign to…" />
        </SelectTrigger>
        <SelectContent>
          {packs.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.user?.name ?? "Unknown"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="default"
        size="xs"
        onClick={() => packId && onAssign(packId)}
        disabled={!packId}
      >
        Add
      </Button>
      <Button variant="ghost" size="icon-xs" onClick={onCancel} aria-label="Cancel">
        <X className="size-3" />
      </Button>
    </div>
  );
}
