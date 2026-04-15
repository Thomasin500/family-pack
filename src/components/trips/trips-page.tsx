"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "@/hooks/use-trips";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewTripDialog } from "./new-trip-dialog";
import { MapPin, Calendar, Users, Plus } from "lucide-react";

export function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Trips</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-xl border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          New Trip
        </Button>
      </div>

      {!trips || trips.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <MapPin className="size-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">No trips yet.</p>
            <p className="text-muted-foreground text-sm mb-4">
              Plan your first adventure!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" data-icon="inline-start" />
              New Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {trips.map((trip: any) => (
            <Card
              key={trip.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/app/trips/${trip.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{trip.name}</CardTitle>
                  {trip.season && (
                    <Badge variant="secondary" className="text-xs capitalize shrink-0">
                      {trip.season}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {trip.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>{trip.location}</span>
                  </div>
                )}
                {(trip.startDate || trip.endDate) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>
                      {trip.startDate && formatDate(trip.startDate)}
                      {trip.startDate && trip.endDate && " - "}
                      {trip.endDate && formatDate(trip.endDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>
                    {trip.members?.length ?? 0}{" "}
                    {(trip.members?.length ?? 0) === 1 ? "member" : "members"}
                  </span>
                </div>
              </CardContent>
            </Card>
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
