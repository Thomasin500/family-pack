"use client";

import { useState } from "react";
import { useAddToPack } from "@/hooks/use-trip-pack-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { displayWeight } from "@/lib/weight";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddToPackDialog } from "./add-to-pack-dialog";
import { Package, Plus } from "lucide-react";

interface SharedGearPoolProps {
  items: any[];
  packs: any[];
  tripId: string;
}

export function SharedGearPool({ items, packs, tripId }: SharedGearPoolProps) {
  const addToPack = useAddToPack(tripId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPackId, setDialogPackId] = useState<string | null>(null);

  function handleAssign(itemId: string, packId: string) {
    addToPack.mutate({ packId, itemId });
  }

  function openAddDialog() {
    // Default to first pack if available
    const defaultPack = packs[0];
    if (defaultPack) {
      setDialogPackId(defaultPack.id);
      setDialogOpen(true);
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Shared Gear Pool</h3>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={openAddDialog}>
          <Plus className="size-3.5" data-icon="inline-start" />
          Add from closet
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No unassigned shared gear. Add items from the closet or all shared
          items have been assigned.
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item: any) => (
            <SharedItemRow
              key={item.id}
              item={item}
              packs={packs}
              onAssign={handleAssign}
            />
          ))}
        </div>
      )}

      {dialogOpen && dialogPackId && (
        <AddToPackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tripId={tripId}
          packId={dialogPackId}
          userId={packs.find((p: any) => p.id === dialogPackId)?.userId}
          packs={packs}
          onChangePackId={setDialogPackId}
        />
      )}
    </div>
  );
}

function SharedItemRow({
  item,
  packs,
  onAssign,
}: {
  item: any;
  packs: any[];
  onAssign: (itemId: string, packId: string) => void;
}) {
  const [selectedPackId, setSelectedPackId] = useState("");

  function handleAssignClick() {
    if (selectedPackId) {
      onAssign(item.id, selectedPackId);
      setSelectedPackId("");
    }
  }

  // If only one pack, show a direct assign button
  if (packs.length === 1) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-sm truncate flex-1 min-w-0">{item.name}</span>
        <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
          {displayWeight(item.weightGrams ?? 0, "imperial")}
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onAssign(item.id, packs[0].id)}
        >
          Add
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm truncate flex-1 min-w-0">{item.name}</span>
      <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
        {displayWeight(item.weightGrams ?? 0, "imperial")}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <Select value={selectedPackId} onValueChange={setSelectedPackId}>
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            {packs.map((pack: any) => (
              <SelectItem key={pack.id} value={pack.id}>
                {pack.user?.name ?? "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="xs"
          onClick={handleAssignClick}
          disabled={!selectedPackId}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
