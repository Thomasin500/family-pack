"use client";

import { useTrip } from "@/hooks/use-trips";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { useHousehold } from "@/hooks/use-household";
import { computePackedQuantities, filterPoolItems } from "@/lib/pool";
import { PackColumn, SortablePackItemRow } from "./pack-column";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  useBumpPackItem,
  useMovePackItem,
  useRemoveFromPack,
  useUpdatePackItem,
} from "@/hooks/use-trip-pack-items";
import { PoolChip } from "./gear-pool";
import dynamic from "next/dynamic";

const GearPool = dynamic(() => import("./gear-pool").then((m) => m.GearPool), {
  ssr: false,
});
import { useUpdateTrip } from "@/hooks/use-trips";
import {
  MapPin,
  Calendar,
  Pencil,
  CheckCircle2,
  RotateCcw,
  Users,
  Route,
  Mountain,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { EditTripDialog } from "./edit-trip-dialog";
import { TripMembersDialog } from "./trip-members-dialog";
import { TripStatsPanel } from "./trip-stats-panel";
import Link from "next/link";

interface TripWorkspaceProps {
  tripId: string;
}

type DragPayload =
  | { type: "pool-item"; item: any }
  | { type: "pack-item"; tripPackItemId: string; fromPackId: string; pi: any };

export function TripWorkspace({ tripId }: TripWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const checklistMode = searchParams.get("checklist") === "true";
  const toggleChecklist = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (checklistMode) {
      params.delete("checklist");
    } else {
      params.set("checklist", "true");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [checklistMode, searchParams, router, pathname]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);

  // Deep-link to a specific pack: `...#pack-<packId>` scrolls that pack into
  // view once it has rendered. Pairs with the `data-pack-id` attribute on
  // PackColumn and the "in X's pack" chips in the Gear Pool.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#pack-")) return;
    const packId = hash.slice("#pack-".length);
    // RAF ensures the target has laid out (pack columns are dynamic imports).
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-pack-id="${packId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [tripId]);
  const updateTrip = useUpdateTrip();
  const bumpPackItem = useBumpPackItem(tripId);
  const movePackItem = useMovePackItem(tripId);
  const removeFromPack = useRemoveFromPack(tripId);
  const updatePackItem = useUpdatePackItem(tripId);
  const { unit } = useWeightUnit();
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: categories } = useCategories();
  const { data: allItems } = useItems();
  const { data: householdData } = useHousehold();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

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
  const packedQuantities = computePackedQuantities(packs);
  const poolItems = filterPoolItems(allItems ?? [], packedQuantities);

  // Build itemId → pack info map for the "already packed" badge. When an item
  // is split across packs (stackable), we pick the first one that has it.
  const itemPackMap: Record<string, { packId: string; packName: string }> = {};
  for (const pack of packs) {
    for (const pi of pack.packItems ?? []) {
      const id = pi.item?.id ?? pi.itemId;
      if (id && !itemPackMap[id]) {
        itemPackMap[id] = {
          packId: pack.id,
          packName: pack.user?.name ?? "a pack",
        };
      }
    }
  }

  const householdId = householdData?.household?.id as string | undefined;
  const members = (householdData?.members ?? []) as any[];

  // 1 pack: single centered column. 2–3: grid. 4+: horizontal scroll with
  // fixed-width cards (3 visible on wide screens, scroll to see the rest).
  const manyPacks = packs.length >= 4;
  const gridClass =
    packs.length === 1
      ? "grid-cols-1 max-w-2xl mx-auto"
      : packs.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  function findPackItem(tripPackItemId: string): {
    pack: any;
    pi: any;
  } | null {
    for (const pack of packs) {
      for (const pi of pack.packItems ?? []) {
        if (pi.id === tripPackItemId) return { pack, pi };
      }
    }
    return null;
  }

  function handleDragStart(evt: DragStartEvent) {
    const data = evt.active.data.current as DragPayload | undefined;
    if (data) setActiveDrag(data);
  }

  function handleDragEnd(evt: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = evt;
    if (!over) return;
    const src = active.data.current as DragPayload | undefined;
    const tgt = over.data.current as
      | { type: "pack"; packId: string }
      | { type: "pool" }
      | { type: "pack-item"; tripPackItemId: string; fromPackId: string; pi: any }
      | undefined;
    if (!src || !tgt) return;

    // Pool → Pack : upsert
    if (src.type === "pool-item" && tgt.type === "pack") {
      bumpPackItem.mutate({ packId: tgt.packId, itemId: src.item.id });
      return;
    }

    // Pool → pool or pool → existing pack-item — no-op for now; drag over
    // another item inside a pack should still count as a drop on that pack.
    if (src.type === "pool-item" && tgt.type === "pack-item") {
      bumpPackItem.mutate({ packId: tgt.fromPackId, itemId: src.item.id });
      return;
    }

    // Pack item → Pool : unassign (or decrement stackable).
    if (src.type === "pack-item" && tgt.type === "pool") {
      const isStackable = !!src.pi?.item?.allowMultiple;
      const qty = src.pi?.quantity ?? 1;
      if (isStackable && qty > 1) {
        updatePackItem.mutate({
          packId: src.fromPackId,
          itemId: src.tripPackItemId,
          quantity: qty - 1,
        });
      } else {
        removeFromPack.mutate({
          packId: src.fromPackId,
          itemId: src.tripPackItemId,
        });
      }
      return;
    }

    // Pack item → Pack column : cross-pack move (different pack).
    if (src.type === "pack-item" && tgt.type === "pack") {
      if (tgt.packId === src.fromPackId) return; // same-pack drop, no-op
      movePackItem.mutate({
        tripPackItemId: src.tripPackItemId,
        toPackId: tgt.packId,
      });
      return;
    }

    // Pack item → Pack item : reorder (same pack) or cross-pack move.
    if (src.type === "pack-item" && tgt.type === "pack-item") {
      if (src.tripPackItemId === tgt.tripPackItemId) return;
      if (src.fromPackId === tgt.fromPackId) {
        // intra-pack reorder: place src where tgt was. Compute new sortOrder
        // by averaging around target (naïve but gets the ordering right).
        const sibling = findPackItem(tgt.tripPackItemId);
        const newOrder = sibling ? (sibling.pi.sortOrder ?? 0) - 1 : 0;
        updatePackItem.mutate({
          packId: src.fromPackId,
          itemId: src.tripPackItemId,
          sortOrder: Math.max(0, newOrder),
        });
      } else {
        movePackItem.mutate({
          tripPackItemId: src.tripPackItemId,
          toPackId: tgt.fromPackId,
        });
      }
      return;
    }
  }

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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{trip.name}</h1>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setEditDialogOpen(true)}
                  aria-label="Edit trip details"
                >
                  <Pencil className="size-4 text-outline" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setMembersDialogOpen(true)}
                  aria-label="Manage trip members"
                >
                  <Users className="size-4 text-outline" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-outline">
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
                {typeof trip.distanceMiles === "number" && trip.distanceMiles > 0 && (
                  <span className="flex items-center gap-1">
                    <Route className="size-3.5" />
                    {trip.distanceMiles} mi
                  </span>
                )}
                {typeof trip.elevationGainFt === "number" && trip.elevationGainFt > 0 && (
                  <span
                    className="flex items-center gap-1"
                    title={
                      trip.elevationHighFt
                        ? `High point: ${trip.elevationHighFt.toLocaleString()} ft`
                        : undefined
                    }
                  >
                    <Mountain className="size-3.5" />
                    {trip.elevationGainFt.toLocaleString()} ft gain
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
                  onClick={toggleChecklist}
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
              {trip.completedAt ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTrip.mutate({ id: trip.id, completedAt: null })}
                  className="text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Reopen
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTrip.mutate({ id: trip.id, completedAt: new Date().toISOString() })
                  }
                  className="text-xs"
                >
                  <CheckCircle2 className="size-3.5" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completed banner */}
      {trip.completedAt && (
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 text-center">
          <span className="text-sm font-bold text-primary">
            Trip completed {formatDate(trip.completedAt)}
          </span>
        </div>
      )}

      {/* Pack Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
          {householdId && (
            <div className="mb-6">
              <GearPool
                items={poolItems}
                allItems={allItems ?? []}
                packs={packs}
                categories={categories ?? []}
                members={members}
                householdId={householdId}
                tripId={tripId}
                packedQuantities={packedQuantities}
                forceExpanded={activeDrag?.type === "pack-item"}
                itemPackMap={itemPackMap}
              />
            </div>
          )}
          <div className="mb-6">
            <TripStatsPanel trip={trip} />
          </div>

          {manyPacks ? (
            <div
              className="grid grid-flow-col auto-cols-[minmax(320px,1fr)] gap-8 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory"
              style={{ gridTemplateColumns: `repeat(${packs.length}, minmax(320px, 1fr))` }}
            >
              {packs.map((pack: any) => (
                <div key={pack.id} className="snap-start min-w-0 xl:min-w-[33.333%]">
                  <ErrorBoundary fallbackLabel="Pack failed to load">
                    <PackColumn
                      pack={pack}
                      categories={categories ?? []}
                      tripId={tripId}
                      checklistMode={checklistMode}
                      allPacks={packs}
                    />
                  </ErrorBoundary>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-8 ${gridClass}`}>
              {packs.map((pack: any) => (
                <ErrorBoundary key={pack.id} fallbackLabel="Pack failed to load">
                  <PackColumn
                    pack={pack}
                    categories={categories ?? []}
                    tripId={tripId}
                    checklistMode={checklistMode}
                    allPacks={packs}
                  />
                </ErrorBoundary>
              ))}
            </div>
          )}
          {manyPacks && (
            <p className="mt-2 text-[11px] text-outline text-center">
              ← scroll to see all {packs.length} packs →
            </p>
          )}
        </div>

        <DragOverlay>
          {activeDrag?.type === "pool-item" ? (
            <PoolChip
              item={activeDrag.item}
              ownerText={
                activeDrag.item.ownerType === "shared"
                  ? "Shared"
                  : (members.find((m) => m.id === activeDrag.item.ownerId)?.name ?? "")
              }
              isSharedUnassigned={false}
              packedQty={packedQuantities[activeDrag.item.id] ?? 0}
              unit={unit}
              asOverlay
            />
          ) : activeDrag?.type === "pack-item" ? (
            <SortablePackItemRow
              pi={activeDrag.pi}
              unit={unit}
              checklistMode={false}
              onToggleChecked={() => {}}
              onRemove={() => {}}
              asOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <EditTripDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} trip={trip} />
      <TripMembersDialog
        open={membersDialogOpen}
        onOpenChange={setMembersDialogOpen}
        tripId={tripId}
        currentMemberIds={(trip.members ?? []).map((m: any) => m.userId ?? m.user?.id)}
      />
    </div>
  );
}

function formatDate(dateStr: string): string {
  // dateStr may be a date-only "2026-07-15" or a full ISO timestamp "2026-04-15T14:32:45.000Z"
  const date = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
