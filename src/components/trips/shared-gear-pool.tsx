"use client";

import { useState } from "react";
import { useAddToPack } from "@/hooks/use-trip-pack-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
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
  const { unit } = useWeightUnit();
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
    <div className="rounded-2xl bg-card p-6 border border-outline-variant/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Package className="size-5 text-primary-container" />
          Shared Gear Pool
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={openAddDialog}
          className="text-primary hover:underline font-bold"
        >
          <Plus className="size-3.5" data-icon="inline-start" />
          Add Shared Gear
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 py-8">
          <span className="text-xs font-bold text-outline uppercase tracking-widest">
            All shared gear assigned
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <SharedItemRow
              key={item.id}
              item={item}
              packs={packs}
              onAssign={handleAssign}
              unit={unit}
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
  unit,
}: {
  item: any;
  packs: any[];
  onAssign: (itemId: string, packId: string) => void;
  unit: "imperial" | "metric";
}) {
  const [selectedPackId, setSelectedPackId] = useState("");

  function handleAssignClick() {
    if (selectedPackId) {
      onAssign(item.id, selectedPackId);
      setSelectedPackId("");
    }
  }

  if (packs.length === 1) {
    return (
      <div className="flex items-center gap-4 rounded-xl bg-surface-high p-4 hover:bg-surface-bright transition-colors">
        <div>
          <div className="text-sm font-bold">{item.name}</div>
          <div className="text-xs text-outline font-mono tabular-nums">
            {displayWeight(item.weightGrams ?? 0, unit)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-high p-4 hover:bg-surface-bright transition-colors">
      <div className="flex-1">
        <div className="text-sm font-bold">{item.name}</div>
        <div className="text-xs text-outline font-mono tabular-nums">
          {displayWeight(item.weightGrams ?? 0, unit)}
        </div>
      </div>
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
        <Button variant="outline" size="xs" onClick={handleAssignClick} disabled={!selectedPackId}>
          Add
        </Button>
      </div>
    </div>
  );
}
