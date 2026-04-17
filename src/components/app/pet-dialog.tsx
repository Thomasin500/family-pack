"use client";

import { useState } from "react";
import { useAddMember, useUpdateMember, useDeleteMember } from "@/hooks/use-household";
import { useConfirm } from "@/components/providers/confirm-provider";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PawPrint } from "lucide-react";
import { yearsToBirthDate, birthDateToYears } from "@/lib/age";

interface PetDialogPet {
  id: string;
  name: string;
  bodyWeightKg?: number | null;
  breed?: string | null;
  birthDate?: string | null;
}

interface PetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pet to edit. Omit to create a new pet. */
  pet?: PetDialogPet;
}

/**
 * Dialog for creating or editing a pet household member. Age is stored as
 * `birthDate` on the user row so it naturally drifts forward year over year.
 */
export function PetDialog({ open, onOpenChange, pet }: PetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PawPrint className="size-4 text-primary" />
            {pet ? `Edit ${pet.name}` : "Add a pet"}
          </DialogTitle>
          <DialogDescription>
            Pets are household members without sign-in. Any adult in the household can manage their
            gear and pack.
          </DialogDescription>
        </DialogHeader>
        {open && <PetDialogForm pet={pet} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function PetDialogForm({ pet, onClose }: { pet?: PetDialogPet; onClose: () => void }) {
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const confirm = useConfirm();
  const { unit } = useWeightUnit();

  const isMetric = unit === "g" || unit === "kg";
  const weightUnitLabel = isMetric ? "kg" : "lb";

  const [name, setName] = useState(pet?.name ?? "");
  const [breed, setBreed] = useState(pet?.breed ?? "");
  const [weightRaw, setWeightRaw] = useState(() => {
    if (!pet?.bodyWeightKg) return "";
    return isMetric ? String(pet.bodyWeightKg) : Math.round(pet.bodyWeightKg * 2.20462).toString();
  });
  const [age, setAge] = useState(pet?.birthDate ? String(birthDateToYears(pet.birthDate)) : "");

  const isEdit = !!pet;
  const pending = addMember.isPending || updateMember.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const parsedWeight = parseFloat(weightRaw);
    const bodyWeightKg =
      Number.isFinite(parsedWeight) && parsedWeight > 0
        ? isMetric
          ? Math.round(parsedWeight)
          : Math.round(parsedWeight / 2.20462)
        : null;

    const parsedAge = parseInt(age, 10);
    const birthDate =
      Number.isFinite(parsedAge) && parsedAge >= 0 ? yearsToBirthDate(parsedAge) : null;

    const trimmedBreed = breed.trim();

    if (isEdit && pet) {
      updateMember.mutate(
        {
          id: pet.id,
          name: trimmedName,
          bodyWeightKg,
          breed: trimmedBreed || null,
          birthDate,
        },
        {
          onSuccess: () => {
            toast.success(`${trimmedName} updated`);
            onClose();
          },
        }
      );
    } else {
      addMember.mutate(
        {
          name: trimmedName,
          role: "pet",
          bodyWeightKg: bodyWeightKg ?? undefined,
          breed: trimmedBreed || undefined,
          birthDate: birthDate ?? undefined,
        },
        {
          onSuccess: () => {
            toast.success(`${trimmedName} added to household`);
            onClose();
          },
        }
      );
    }
  }

  async function handleDelete() {
    if (!pet) return;
    const ok = await confirm({
      title: `Remove ${pet.name}?`,
      description:
        "They'll no longer be part of the household. Their gear and trip memberships will also be removed.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    deleteMember.mutate(pet.id, {
      onSuccess: () => {
        toast.success(`${pet.name} removed`);
        onClose();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pet-name">Name</Label>
        <Input
          id="pet-name"
          placeholder="Birch"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="pet-weight">Weight ({weightUnitLabel})</Label>
          <Input
            id="pet-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder={isMetric ? "25" : "55"}
            value={weightRaw}
            onChange={(e) => setWeightRaw(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pet-age">Age (years)</Label>
          <Input
            id="pet-age"
            type="number"
            min="0"
            max="40"
            step="1"
            placeholder="3"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pet-breed">Breed</Label>
        <Input
          id="pet-breed"
          placeholder="Golden Retriever"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          disabled={pending}
        />
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={pending || deleteMember.isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Remove
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!name.trim() || pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save"
            ) : (
              "Add pet"
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
