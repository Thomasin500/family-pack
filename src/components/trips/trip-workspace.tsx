"use client";

import { useTrip } from "@/hooks/use-trips";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { PackColumn } from "./pack-column";
import { SharedGearPool } from "./shared-gear-pool";
import { Badge } from "@/components/ui/badge";
import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { MapPin, Calendar, ArrowLeft, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TripWorkspaceProps {
  tripId: string;
}

export function TripWorkspace({ tripId }: TripWorkspaceProps) {
  const { unit } = useWeightUnit();
  const [checklistMode, setChecklistMode] = useState(false);
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: categories } = useCategories();
  const { data: allItems } = useItems();

  if (tripLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-4" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-medium mb-2">Trip not found</p>
        <Link href="/app/trips">
          <Button variant="outline">Back to Trips</Button>
        </Link>
      </div>
    );
  }

  const packs: any[] = trip.packs ?? [];

  // Collect all item IDs already in any pack
  const itemIdsInPacks = new Set<string>();
  for (const pack of packs) {
    for (const pi of pack.packItems ?? []) {
      itemIdsInPacks.add(pi.item?.id ?? pi.itemId);
    }
  }

  // Shared household items not yet assigned to any pack
  const sharedItems = (allItems ?? []).filter(
    (item: any) =>
      item.ownerType === "shared" && !itemIdsInPacks.has(item.id)
  );

  // Calculate per-pack weight totals for the summary bar
  const packWeights = packs.map((pack: any) => {
    const items = pack.packItems ?? [];
    let total = 0;
    for (const pi of items) {
      const w = pi.item?.weightGrams ?? 0;
      const qty = pi.quantity ?? 1;
      total += w * qty;
    }
    return {
      userId: pack.userId,
      userName: pack.user?.name ?? "Unknown",
      totalGrams: total,
    };
  });

  // Determine grid columns based on pack count
  const gridClass =
    packs.length === 1
      ? "grid-cols-1 max-w-2xl"
      : packs.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/app/trips">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold truncate">{trip.name}</h1>
            {trip.season && (
              <Badge variant="secondary" className="capitalize shrink-0">
                {trip.season}
              </Badge>
            )}
            <Button
              variant={checklistMode ? "default" : "outline"}
              size="sm"
              onClick={() => setChecklistMode(!checklistMode)}
              className="gap-1.5 ml-auto shrink-0"
            >
              <ClipboardCheck className="size-3.5" />
              <span className="hidden sm:inline">Checklist</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 ml-10 text-sm text-muted-foreground">
            {trip.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {trip.location}
              </span>
            )}
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(trip.startDate)}
                {trip.endDate && ` - ${formatDate(trip.endDate)}`}
              </span>
            )}
            {trip.terrain && (
              <span className="capitalize">{trip.terrain}</span>
            )}
          </div>
        </div>
      </div>

      {/* Pack Columns */}
      <div className="flex-1 px-4 py-6 sm:px-6">
        <div className={`grid gap-4 ${gridClass}`}>
          {packs.map((pack: any) => (
            <PackColumn
              key={pack.id}
              pack={pack}
              categories={categories ?? []}
              tripId={tripId}
              checklistMode={checklistMode}
            />
          ))}
        </div>

        {/* Shared Gear Pool */}
        <div className="mt-6">
          <SharedGearPool
            items={sharedItems}
            packs={packs}
            tripId={tripId}
          />
        </div>
      </div>

      {/* Weight Summary Bar */}
      {packWeights.length > 0 && (
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-2.5 sm:px-6 flex items-center gap-6 overflow-x-auto">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
              Total Weight
            </span>
            {packWeights.map((pw) => (
              <div
                key={pw.userId}
                className="flex items-center gap-2 shrink-0"
              >
                <span className="text-sm font-medium">{pw.userName}</span>
                <span className="text-sm font-mono tabular-nums text-muted-foreground">
                  {displayWeight(pw.totalGrams, unit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
