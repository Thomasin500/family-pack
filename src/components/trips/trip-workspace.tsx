"use client";

import { useTrip } from "@/hooks/use-trips";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { PackColumn } from "./pack-column";
import dynamic from "next/dynamic";

const SharedGearPool = dynamic(() => import("./shared-gear-pool").then((m) => m.SharedGearPool), {
  ssr: false,
});
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
            <div key={i} className="h-64 rounded-xl border bg-muted/40 animate-pulse" />
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
    (item: any) => item.ownerType === "shared" && !itemIdsInPacks.has(item.id)
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
      <div className="border-b border-outline-variant/10 bg-surface-low sticky top-16 z-10">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-outline text-xs mb-1 uppercase tracking-widest font-semibold">
                <Link href="/app/trips" className="hover:text-primary transition-colors">
                  Trips
                </Link>
                <span>&rsaquo;</span>
                <span className="text-foreground">{trip.name}</span>
              </nav>
              <h1 className="text-3xl font-extrabold tracking-tight">{trip.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-outline">
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
                    {trip.endDate && ` \u2013 ${formatDate(trip.endDate)}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">
                  Checklist
                </span>
                <button
                  onClick={() => setChecklistMode(!checklistMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    checklistMode ? "bg-primary" : "bg-surface-highest"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                      checklistMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pack Columns */}
      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto">
        <div className={`grid gap-8 ${gridClass}`}>
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
        <div className="mt-8">
          <SharedGearPool items={sharedItems} packs={packs} tripId={tripId} />
        </div>
      </div>
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
