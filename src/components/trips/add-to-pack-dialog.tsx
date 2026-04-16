"use client";

import { useState, useMemo } from "react";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { useTrip } from "@/hooks/use-trips";
import { useAddToPack } from "@/hooks/use-trip-pack-items";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayWeight } from "@/lib/weight";
import { Check, Search } from "lucide-react";

interface AddToPackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  packId: string;
  packs: any[];
  onChangePackId?: (packId: string) => void;
}

export function AddToPackDialog({
  open,
  onOpenChange,
  tripId,
  packId: initialPackId,
  packs,
}: AddToPackDialogProps) {
  const { data: allItems } = useItems();
  const { data: categories } = useCategories();
  const { data: trip } = useTrip(tripId);
  const addToPack = useAddToPack(tripId);
  const { unit } = useWeightUnit();

  const [selectedPackId, setSelectedPackId] = useState(initialPackId);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  const packId = selectedPackId;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      // Reset state when dialog opens
      setSelectedPackId(initialPackId);
      setAddedItemIds(new Set());
      setSearch("");
      setCategoryFilter("all");
    }
    onOpenChange(nextOpen);
  }

  const currentPack = packs.find((p: any) => p.id === packId);
  const packUserId = currentPack?.user?.id ?? currentPack?.userId;

  // Collect all item IDs already in any pack for this trip
  const itemIdsInTrip = useMemo(() => {
    const ids = new Set<string>();
    for (const pack of trip?.packs ?? []) {
      for (const pi of pack.packItems ?? []) {
        ids.add(pi.item?.id ?? pi.itemId);
      }
    }
    return ids;
  }, [trip]);

  // Filter items: show only this user's personal items + shared items, not already in trip
  const filteredItems = useMemo(() => {
    if (!allItems) return [];
    return allItems.filter((item: any) => {
      // Exclude items already in the trip
      if (itemIdsInTrip.has(item.id) && !addedItemIds.has(item.id)) return false;
      if (addedItemIds.has(item.id)) return false;

      // Only show: this pack owner's personal items + shared household items
      if (item.ownerType === "personal" && item.ownerId !== packUserId) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && item.categoryId !== categoryFilter) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (item.name ?? "").toLowerCase();
        const brand = (item.brand ?? "").toLowerCase();
        if (!name.includes(q) && !brand.includes(q)) return false;
      }

      return true;
    });
  }, [allItems, itemIdsInTrip, addedItemIds, categoryFilter, search, packUserId]);

  async function handleAddItem(itemId: string) {
    try {
      await addToPack.mutateAsync({ packId, itemId });
      setAddedItemIds((prev) => new Set(prev).add(itemId));
    } catch {
      // handled by TanStack Query
    }
  }

  function handleChangePackId(newPackId: string) {
    setSelectedPackId(newPackId);
    setAddedItemIds(new Set());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Items to Pack</DialogTitle>
          <DialogDescription>
            Choose items from the closet to add to {currentPack?.user?.name ?? "this"} pack.
          </DialogDescription>
        </DialogHeader>

        {/* Pack selector (if multiple packs) */}
        {packs.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Pack:</span>
            <Select value={packId} onValueChange={handleChangePackId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {packs.map((pack: any) => (
                  <SelectItem key={pack.id} value={pack.id}>
                    {pack.user?.name ?? "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full inline-block"
                      style={{ backgroundColor: cat.color ?? "#6b7280" }}
                    />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search || categoryFilter !== "all"
                ? "No matching items found."
                : "All items have been added to this trip."}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredItems.map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItem(item.id)}
                  disabled={addToPack.isPending}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {item.category && (
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: item.category?.color ?? "#6b7280",
                      }}
                    />
                  )}
                  <span className="text-sm truncate flex-1 min-w-0">
                    {item.name}
                    {item.brand && (
                      <span className="text-muted-foreground ml-1">({item.brand})</span>
                    )}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                    {displayWeight(item.weightGrams ?? 0, unit)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {addedItemIds.size > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2 border-t">
            <Check className="size-3.5" />
            <span>
              {addedItemIds.size} {addedItemIds.size === 1 ? "item" : "items"} added
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
