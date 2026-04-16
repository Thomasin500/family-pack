"use client";

import { useState } from "react";
import { useAddToPack } from "@/hooks/use-trip-pack-items";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useClickOutside } from "@/hooks/use-click-outside";
import { displayWeight } from "@/lib/weight";
import { Package, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  items: any[];
  packs: any[];
  tripId: string;
}

export function UnassignedSharedBar({ items, packs, tripId }: Props) {
  const addToPack = useAddToPack(tripId);
  const { unit } = useWeightUnit();
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (items.length === 0) return null;

  function assign(itemId: string, packId: string) {
    addToPack.mutate({ packId, itemId });
    setOpenItemId(null);
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Package className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {items.length} shared {items.length === 1 ? "item" : "items"} unassigned
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {items.map((item: any) => {
            const isOpen = openItemId === item.id;
            if (isOpen) {
              return (
                <SharedAssignInline
                  key={item.id}
                  item={item}
                  packs={packs}
                  unit={unit}
                  onAssign={(packId) => assign(item.id, packId)}
                  onCancel={() => setOpenItemId(null)}
                />
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (packs.length === 1) {
                    assign(item.id, packs[0].id);
                  } else {
                    setOpenItemId(item.id);
                  }
                }}
                className="group inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium border border-outline-variant/20 hover:border-primary hover:bg-primary/10 transition-colors"
                title={packs.length === 1 ? "Click to assign" : "Click to pick carrier"}
              >
                <span>{item.name}</span>
                <span className="text-outline font-mono tabular-nums">
                  {displayWeight(item.weightGrams ?? 0, unit)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SharedAssignInline({
  item,
  packs,
  unit,
  onAssign,
  onCancel,
}: {
  item: any;
  packs: any[];
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
          {packs.map((p: any) => (
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
