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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    name: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    season?: string | null;
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
  const [startDate, setStartDate] = useState(trip.startDate ?? "");
  const [endDate, setEndDate] = useState(trip.endDate ?? "");
  const [season, setSeason] = useState(trip.season ?? "");
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
      season: season && season !== "none" ? season : null,
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
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-trip-season">Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger id="edit-trip-season">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-trip-terrain">Terrain</Label>
          <Input
            id="edit-trip-terrain"
            placeholder="e.g. Alpine"
            value={terrain}
            onChange={(e) => setTerrain(e.target.value)}
          />
        </div>
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
