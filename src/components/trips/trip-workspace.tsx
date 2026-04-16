"use client";

import { useTrip } from "@/hooks/use-trips";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { PackColumn } from "./pack-column";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import dynamic from "next/dynamic";

const UnassignedSharedBar = dynamic(
  () => import("./unassigned-shared-bar").then((m) => m.UnassignedSharedBar),
  { ssr: false }
);
import { useUpdateTrip } from "@/hooks/use-trips";
import { MapPin, Calendar, Pencil, CheckCircle2, RotateCcw, Users } from "lucide-react";
import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditTripDialog } from "./edit-trip-dialog";
import { TripMembersDialog } from "./trip-members-dialog";
import Link from "next/link";

interface TripWorkspaceProps {
  tripId: string;
}

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
  const updateTrip = useUpdateTrip();
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
      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {sharedItems.length > 0 && (
          <div className="mb-6">
            <UnassignedSharedBar items={sharedItems} packs={packs} tripId={tripId} />
          </div>
        )}
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
      </div>

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
