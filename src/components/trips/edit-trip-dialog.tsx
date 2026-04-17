"use client";

import { useState } from "react";
import { useUpdateTrip } from "@/hooks/use-trips";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Native `<input type="date">` requires a `YYYY-MM-DD` value. Drizzle/Postgres
 * may hand back a full ISO timestamp when the runtime driver treats the column
 * as a Date; strip the time portion so the picker actually pre-fills.
 */
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes("T")) return value.split("T")[0];
  return value;
}

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    name: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    terrain?: string | null;
  };
}

export function EditTripDialog({ open, onOpenChange, trip }: EditTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
        </DialogHeader>
        {open && <EditTripForm trip={trip} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function EditTripForm({
  trip,
  onClose,
}: {
  trip: EditTripDialogProps["trip"];
  onClose: () => void;
}) {
  const updateTrip = useUpdateTrip();

  const [name, setName] = useState(trip.name ?? "");
  const [location, setLocation] = useState(trip.location ?? "");
  const [startDate, setStartDate] = useState(toDateInputValue(trip.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(trip.endDate));
  const [terrain, setTerrain] = useState(trip.terrain ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await updateTrip.mutateAsync({
      id: trip.id,
      name: name.trim(),
      location: location.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
      terrain: terrain.trim() || null,
    });

    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-trip-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-trip-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-trip-location">Location</Label>
        <Input
          id="edit-trip-location"
          placeholder="e.g. Sierra Nevada, CA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-trip-start">Start Date</Label>
          <Input
            id="edit-trip-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-trip-end">End Date</Label>
          <Input
            id="edit-trip-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-trip-notes">Notes</Label>
        <textarea
          id="edit-trip-notes"
          placeholder="Terrain, route, weather expectations, anything worth remembering…"
          value={terrain}
          onChange={(e) => setTerrain(e.target.value)}
          rows={3}
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || updateTrip.isPending}>
          {updateTrip.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
