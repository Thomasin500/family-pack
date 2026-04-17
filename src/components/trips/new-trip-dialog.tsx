"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHousehold } from "@/hooks/use-household";
import { useCreateTrip } from "@/hooks/use-trips";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTripDialog({ open, onOpenChange }: NewTripDialogProps) {
  const router = useRouter();
  const { data: household } = useHousehold();
  const createTrip = useCreateTrip();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terrain, setTerrain] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const members = household?.members ?? [];

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  function resetForm() {
    setName("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setTerrain("");
    setSelectedMembers([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedMembers.length === 0) return;

    try {
      const result: any = await createTrip.mutateAsync({
        name: name.trim(),
        description: undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        location: location.trim() || undefined,
        terrain: terrain.trim() || undefined,
        memberIds: selectedMembers,
      });

      resetForm();
      onOpenChange(false);
      router.push(`/app/trips/${result.id}`);
    } catch {
      // mutation error is handled by TanStack Query
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Trip</DialogTitle>
          <DialogDescription>Plan a backpacking trip for your household.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trip-name"
              placeholder="e.g. PCT Section J"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-location">Location</Label>
            <Input
              id="trip-location"
              placeholder="e.g. Sierra Nevada, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="trip-start">Start Date</Label>
              <Input
                id="trip-start"
                type="date"
                value={startDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setStartDate(next);
                  // If end date hasn't been set yet, mirror the start so the
                  // picker opens on the right month and the trip isn't
                  // accidentally saved without an end date. Functional setter
                  // avoids a stale closure read of `endDate`.
                  if (next) setEndDate((prev) => prev || next);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip-end">End Date</Label>
              <Input
                id="trip-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-notes">Notes</Label>
            <textarea
              id="trip-notes"
              placeholder="Terrain, route, weather expectations, anything worth remembering…"
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              rows={3}
              className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-3">
            <Label>
              Who&apos;s going? <span className="text-destructive">*</span>
            </Label>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No household members found. Add members first.
              </p>
            ) : (
              <div className="space-y-2 rounded-md border p-3">
                {members.map((member: any) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 cursor-pointer rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt=""
                          className="size-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {(member.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm truncate">{member.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedMembers.length === 0 && (
              <p className="text-xs text-muted-foreground">Select at least one member.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || selectedMembers.length === 0 || createTrip.isPending}
            >
              {createTrip.isPending ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
