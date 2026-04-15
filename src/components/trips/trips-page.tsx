"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips, useDuplicateTrip } from "@/hooks/use-trips";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewTripDialog } from "./new-trip-dialog";
import { MapPin, Calendar, Users, Plus, Copy } from "lucide-react";
import { toast } from "sonner";

export function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const duplicateTrip = useDuplicateTrip();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  function handleDuplicate(e: React.MouseEvent, tripId: string) {
    e.stopPropagation();
    duplicateTrip.mutate(tripId, {
      onSuccess: (data: any) => {
        toast.success("Trip duplicated");
        router.push(`/app/trips/${data.id}`);
      },
    });
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
          {trips.map((trip: any) => (
            <div
              key={trip.id}
              className="cursor-pointer rounded-xl bg-card border border-outline-variant/10 p-6 transition-colors hover:bg-surface-high"
              onClick={() => router.push(`/app/trips/${trip.id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold">{trip.name}</h3>
                {trip.season && (
                  <Badge variant="muted" className="capitalize shrink-0">
                    {trip.season}
                  </Badge>
                )}
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
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-sm text-outline">
                    <Users className="size-3.5" />
                    <span>
                      {trip.members?.length ?? 0}{" "}
                      {(trip.members?.length ?? 0) === 1 ? "member" : "members"}
                    </span>
                  </div>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewTripDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
