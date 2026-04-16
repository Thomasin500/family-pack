"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips, useDuplicateTrip, useDeleteTrip } from "@/hooks/use-trips";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewTripDialog } from "./new-trip-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar, Users, Plus, Copy, Trash2, Search, Backpack } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import { displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";

interface PackWeights {
  userId: string;
  name: string;
  role: "adult" | "child" | "pet";
  base: number;
  carried: number;
}

function computePerPackWeights(trip: any): PackWeights[] {
  const out: PackWeights[] = [];
  for (const pack of trip.packs ?? []) {
    let base = 0;
    let carried = 0;
    for (const pi of pack.packItems ?? []) {
      const w = (pi.item?.weightGrams ?? 0) * (pi.quantity ?? 1);
      const isWorn = pi.isWornOverride ?? pi.item?.isWorn ?? false;
      const isConsumable = pi.isConsumableOverride ?? pi.item?.isConsumable ?? false;
      if (!isWorn) {
        carried += w;
        if (!isConsumable) base += w;
      }
    }
    out.push({
      userId: pack.userId,
      name: pack.user?.name ?? "—",
      role: pack.user?.role ?? "adult",
      base,
      carried,
    });
  }
  return out;
}

export function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const duplicateTrip = useDuplicateTrip();
  const deleteTrip = useDeleteTrip();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const router = useRouter();
  const confirm = useConfirm();
  const { unit } = useWeightUnit();

  function handleDuplicate(e: React.MouseEvent, tripId: string) {
    e.stopPropagation();
    duplicateTrip.mutate(tripId, {
      onSuccess: (data: any) => {
        toast.success("Trip duplicated");
        router.push(`/app/trips/${data.id}`);
      },
    });
  }

  async function handleDelete(e: React.MouseEvent, tripId: string, tripName: string) {
    e.stopPropagation();
    const ok = await confirm({
      title: `Delete "${tripName}"?`,
      description:
        "The trip and all of its pack assignments will be removed. This can't be undone.",
      confirmLabel: "Delete Trip",
      destructive: true,
    });
    if (ok) deleteTrip.mutate(tripId, { onSuccess: () => toast.success("Trip deleted") });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Trips</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Trips</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="size-4" data-icon="inline-start" />
          New Trip
        </Button>
      </div>

      {/* Search + Sort */}
      {trips && trips.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <Input
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-low rounded-xl border-none"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="members">Most Members</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!trips || trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 py-20 text-center">
          <div className="mb-4 rounded-full bg-surface-high p-4">
            <MapPin className="size-8 text-outline" />
          </div>
          <p className="text-lg font-bold mb-1">No trips yet</p>
          <p className="text-outline text-sm mb-4">Plan your first adventure.</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="size-4" data-icon="inline-start" />
            New Trip
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {(() => {
            const filtered = trips.filter((trip: any) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                trip.name?.toLowerCase().includes(q) || trip.location?.toLowerCase().includes(q)
              );
            });

            filtered.sort((a: any, b: any) => {
              switch (sortBy) {
                case "oldest":
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "name":
                  return (a.name ?? "").localeCompare(b.name ?? "");
                case "members":
                  return (b.members?.length ?? 0) - (a.members?.length ?? 0);
                default: // newest
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
            });

            if (filtered.length === 0) {
              return (
                <div className="col-span-2 text-center py-12 text-outline">
                  No trips match your search.
                </div>
              );
            }

            return filtered.map((trip: any) => {
              const perPack = computePerPackWeights(trip);
              const itemCount = (trip.packs ?? []).reduce(
                (sum: number, p: any) => sum + (p.packItems?.length ?? 0),
                0
              );
              return (
                <div
                  key={trip.id}
                  className="cursor-pointer rounded-xl bg-card border border-outline-variant/10 p-6 transition-colors hover:bg-surface-high"
                  onClick={() => router.push(`/app/trips/${trip.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold">{trip.name}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {trip.completedAt && (
                        <Badge variant="default" className="bg-primary/20 text-primary">
                          Done
                        </Badge>
                      )}
                      {trip.season && (
                        <Badge variant="muted" className="capitalize">
                          {trip.season}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {trip.location && (
                      <div className="flex items-center gap-1.5 text-sm text-outline">
                        <MapPin className="size-3.5" />
                        <span>{trip.location}</span>
                      </div>
                    )}
                    {(trip.startDate || trip.endDate) && (
                      <div className="flex items-center gap-1.5 text-sm text-outline">
                        <Calendar className="size-3.5" />
                        <span>
                          {trip.startDate && formatDate(trip.startDate)}
                          {trip.startDate && trip.endDate && " \u2013 "}
                          {trip.endDate && formatDate(trip.endDate)}
                        </span>
                      </div>
                    )}
                    {perPack.length > 0 && (
                      <ul className="pt-1 space-y-0.5">
                        {perPack.map((p) => {
                          const firstName = (p.name ?? "").split(/\s+/)[0] || p.name;
                          return (
                            <li key={p.userId} className="flex items-baseline gap-3 text-sm">
                              <span className="font-bold shrink-0">
                                {p.role === "pet" ? "🐾 " : ""}
                                {firstName}
                              </span>
                              <span className="ml-auto font-mono tabular-nums text-xs text-outline">
                                {displayWeight(p.base, unit)}{" "}
                                <span className="text-outline/50">base</span>
                                {" · "}
                                <span className="text-on-surface-variant">
                                  {displayWeight(p.carried, unit)}
                                </span>{" "}
                                <span className="text-outline/50">carry</span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-sm text-outline">
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {trip.members?.length ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Backpack className="size-3.5" />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleDuplicate(e, trip.id)}
                          disabled={duplicateTrip.isPending}
                          title="Duplicate trip"
                          className="text-outline hover:text-primary"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleDelete(e, trip.id, trip.name)}
                          title="Delete trip"
                          className="text-outline hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      <NewTripDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
