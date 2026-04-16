"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useHousehold,
  useAddMember,
  useUpdateMember,
  useDeleteMember,
} from "@/hooks/use-household";
import { useUpdateProfile } from "@/hooks/use-user-preferences";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useConfirm } from "@/components/providers/confirm-provider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Copy,
  Check,
  PawPrint,
  Backpack,
  Map,
  Plus,
  X,
  Pencil,
  LogOut,
} from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { fetchApi } from "@/lib/fetch";

export function Dashboard() {
  const { data, isLoading } = useHousehold();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const updateProfile = useUpdateProfile();
  const { unit } = useWeightUnit();
  const confirm = useConfirm();

  const [showPetForm, setShowPetForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-outline" />
      </div>
    );
  }

  if (!data?.household) return null;

  const { household, members, currentUserId } = data;
  const currentUser = members.find((m: any) => m.id === currentUserId);

  function handleCopyInviteCode() {
    if (household.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleLeaveHousehold() {
    const ok = await confirm({
      title: `Leave "${household.name}"?`,
      description:
        "Your personal items and the pets/kids you manage come with you. Shared household gear and trips stay with the household. You can join or create another household right after.",
      confirmLabel: "Leave Household",
      destructive: true,
    });
    if (!ok) return;
    try {
      await fetchApi("/api/household/leave", { method: "POST" });
      // Force a full reload so the app re-reads the now-empty household state
      // and routes through HouseholdSetup.
      window.location.href = "/app";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to leave household");
    }
  }

  function handleAddPet(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim()) return;
    addMember.mutate(
      {
        name: petName.trim(),
        role: "pet",
        bodyWeightKg: petWeight ? parseFloat(petWeight) : undefined,
        breed: petBreed.trim() || undefined,
      },
      {
        onSuccess: () => {
          setPetName("");
          setPetWeight("");
          setPetBreed("");
          setShowPetForm(false);
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Welcome back, {currentUser?.name ?? "there"}.
        </h1>
        <p className="text-outline text-lg">Your next trip is coming up.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/app/closet">
              <button className="flex w-full flex-col items-center justify-center rounded-xl bg-card p-6 transition-colors hover:bg-surface-high group">
                <Backpack className="size-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">View Gear Closet</span>
              </button>
            </Link>
            <Link href="/app/trips">
              <button className="flex w-full flex-col items-center justify-center rounded-xl bg-card p-6 transition-colors hover:bg-surface-high group">
                <Map className="size-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Plan Trip</span>
              </button>
            </Link>
          </div>

          {/* Add Pet Form */}
          {showPetForm && (
            <div className="rounded-xl bg-card p-6 border border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Add a Pet</h3>
                <Button variant="ghost" size="icon-xs" onClick={() => setShowPetForm(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <form onSubmit={handleAddPet}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Name</Label>
                    <Input
                      id="pet-name"
                      placeholder="Birch"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      disabled={addMember.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-weight">Weight (kg)</Label>
                    <Input
                      id="pet-weight"
                      type="number"
                      step="0.1"
                      placeholder="25"
                      value={petWeight}
                      onChange={(e) => setPetWeight(e.target.value)}
                      disabled={addMember.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-breed">Breed</Label>
                    <Input
                      id="pet-breed"
                      placeholder="Golden Retriever"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      disabled={addMember.isPending}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!petName.trim() || addMember.isPending}
                    className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    {addMember.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add Pet
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-8">
          {/* Household Members */}
          <section className="rounded-xl bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
                Household
              </h3>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowPetForm(!showPetForm)}
                title="Add pet"
              >
                <PawPrint className="size-4 text-outline" />
              </Button>
            </div>
            <div className="space-y-3">
              {members.map((member: any) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  unit={unit}
                  onUpdateWeight={(kg) => {
                    if (member.role === "adult" && member.email) {
                      updateProfile.mutate(
                        { bodyWeightKg: kg },
                        { onSuccess: () => toast.success("Body weight updated") }
                      );
                    } else {
                      updateMember.mutate(
                        { id: member.id, bodyWeightKg: kg },
                        { onSuccess: () => toast.success("Weight updated") }
                      );
                    }
                  }}
                  onUpdateMember={(fields) => {
                    updateMember.mutate(
                      { id: member.id, ...fields },
                      { onSuccess: () => toast.success("Updated") }
                    );
                  }}
                  onDeleteMember={async () => {
                    const ok = await confirm({
                      title: `Remove ${member.name}?`,
                      description:
                        "They'll no longer be part of the household. Their gear and trip memberships will also be removed.",
                      confirmLabel: "Remove",
                      destructive: true,
                    });
                    if (ok) deleteMember.mutate(member.id);
                  }}
                />
              ))}
            </div>
          </section>

          {/* Invite Code */}
          <section className="rounded-xl bg-card p-6 border border-dashed border-outline-variant/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-4">
              Invite Household
            </h3>
            <div className="flex gap-2">
              <div className="flex-grow rounded-lg bg-surface-lowest px-4 py-3 font-mono text-sm tracking-wider">
                {household.inviteCode}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInviteCode}
                className="rounded-lg bg-surface-bright hover:bg-surface-high"
              >
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-outline mt-3">
              Share this code with family members to sync gear closets.
            </p>
          </section>

          {/* Leave household */}
          {currentUser && (
            <section className="rounded-xl bg-card p-6 border border-outline-variant/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-2">
                Danger Zone
              </h3>
              <p className="text-xs text-outline mb-4">
                Leave {household.name}. Your personal gear and pets/kids you manage come with you —
                join or create another household to bring them along.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveHousehold}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="size-4" data-icon="inline-start" />
                Leave Household
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  unit,
  onUpdateWeight,
  onUpdateMember,
  onDeleteMember,
}: {
  member: any;
  unit: string;
  onUpdateWeight: (kg: number) => void;
  onUpdateMember: (fields: Record<string, unknown>) => void;
  onDeleteMember: () => void;
}) {
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [weightDirtyError, setWeightDirtyError] = useState(false);
  const [editingPet, setEditingPet] = useState(false);
  const [petNameVal, setPetNameVal] = useState("");
  const [petBreedVal, setPetBreedVal] = useState("");
  const [petWeightVal, setPetWeightVal] = useState("");
  const [petDirtyError, setPetDirtyError] = useState(false);

  const isMetricBody = unit === "g" || unit === "kg" || unit === "metric";
  const bodyUnitLabel = isMetricBody ? "kg" : "lb";

  function weightToKg(raw: string): number | null {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed <= 0) return null;
    return isMetricBody ? Math.round(parsed) : Math.round(parsed / 2.20462);
  }

  function isWeightDirty(): boolean {
    const kg = weightToKg(weightValue);
    return kg !== null && kg !== member.bodyWeightKg;
  }

  function isPetDirty(): boolean {
    const trimmedName = petNameVal.trim();
    if (trimmedName && trimmedName !== member.name) return true;
    const trimmedBreed = petBreedVal.trim();
    if (trimmedBreed !== (member.breed ?? "")) return true;
    const kg = weightToKg(petWeightVal);
    if (kg !== null && kg !== member.bodyWeightKg) return true;
    return false;
  }

  const weightRef = useClickOutside<HTMLDivElement>(() => {
    if (!editingWeight) return;
    if (isWeightDirty()) {
      setWeightDirtyError(true);
    } else {
      setEditingWeight(false);
    }
  }, editingWeight);

  const petRef = useClickOutside<HTMLDivElement>(() => {
    if (!editingPet) return;
    if (isPetDirty()) {
      setPetDirtyError(true);
    } else {
      setEditingPet(false);
    }
  }, editingPet);

  function startEditingWeight() {
    if (isMetricBody) {
      setWeightValue(member.bodyWeightKg?.toString() ?? "");
    } else {
      const lbs = member.bodyWeightKg ? (member.bodyWeightKg * 2.20462).toFixed(0) : "";
      setWeightValue(lbs);
    }
    setWeightDirtyError(false);
    setEditingWeight(true);
  }

  function commitWeight() {
    const kg = weightToKg(weightValue);
    setEditingWeight(false);
    setWeightDirtyError(false);
    if (kg !== null && kg !== member.bodyWeightKg) onUpdateWeight(kg);
  }

  function startEditingPet() {
    setPetNameVal(member.name ?? "");
    setPetBreedVal(member.breed ?? "");
    if (isMetricBody) {
      setPetWeightVal(member.bodyWeightKg?.toString() ?? "");
    } else {
      setPetWeightVal(member.bodyWeightKg ? (member.bodyWeightKg * 2.20462).toFixed(0) : "");
    }
    setPetDirtyError(false);
    setEditingPet(true);
  }

  function savePet(e: React.FormEvent) {
    e.preventDefault();
    const updates: Record<string, unknown> = {};
    const trimmedName = petNameVal.trim();
    if (trimmedName && trimmedName !== member.name) updates.name = trimmedName;
    const trimmedBreed = petBreedVal.trim();
    if (trimmedBreed !== (member.breed ?? "")) updates.breed = trimmedBreed || null;
    const kg = weightToKg(petWeightVal);
    if (kg !== null && kg !== member.bodyWeightKg) updates.bodyWeightKg = kg;
    if (Object.keys(updates).length > 0) onUpdateMember(updates);
    setEditingPet(false);
    setPetDirtyError(false);
  }

  const displayWeightStr = member.bodyWeightKg
    ? isMetricBody
      ? `${member.bodyWeightKg} kg`
      : `${Math.round(member.bodyWeightKg * 2.20462)} lb`
    : null;

  const canEditWeight = member.role === "adult" && member.email;
  const isPet = member.role === "pet";
  const isManaged = isPet || member.role === "child";

  if (editingPet) {
    return (
      <div
        ref={petRef}
        className={`rounded-lg bg-surface-low p-3 ${petDirtyError ? "ring-2 ring-destructive/60" : ""}`}
      >
        <form onSubmit={savePet} className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Input
              className="h-7 text-sm"
              placeholder="Name"
              value={petNameVal}
              onChange={(e) => {
                setPetNameVal(e.target.value);
                setPetDirtyError(false);
              }}
              autoFocus
            />
            <Input
              className="h-7 text-sm"
              placeholder="Breed"
              value={petBreedVal}
              onChange={(e) => {
                setPetBreedVal(e.target.value);
                setPetDirtyError(false);
              }}
            />
            <div className="flex items-center gap-1">
              <Input
                className="h-7 text-sm"
                type="number"
                min="0"
                step="0.1"
                placeholder="Weight"
                value={petWeightVal}
                onChange={(e) => {
                  setPetWeightVal(e.target.value);
                  setPetDirtyError(false);
                }}
              />
              <span className="text-xs text-outline">{bodyUnitLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-between">
            {petDirtyError ? (
              <span className="text-[10px] font-bold text-destructive">
                Unsaved changes — Save or Cancel
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPet(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setEditingPet(false);
                  onDeleteMember();
                }}
              >
                Remove
              </Button>
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between rounded-lg bg-surface-low p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary-container/20 text-primary text-xs font-bold">
          {isPet ? <PawPrint className="size-3.5" /> : (member.name?.[0]?.toUpperCase() ?? "?")}
        </div>
        <div>
          <p className="text-sm font-bold">{member.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-outline">
            {member.role}
            {member.breed && ` \u00b7 ${member.breed}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm tabular-nums">
        {(canEditWeight || isManaged) && editingWeight ? (
          <div
            ref={weightRef}
            className={`flex items-center gap-1 ${weightDirtyError ? "rounded-md ring-2 ring-destructive/60 px-1" : ""}`}
          >
            <Input
              className="h-7 w-16 text-sm tabular-nums"
              type="number"
              min="0"
              value={weightValue}
              onChange={(e) => {
                setWeightValue(e.target.value);
                setWeightDirtyError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitWeight();
                if (e.key === "Escape") setEditingWeight(false);
              }}
              autoFocus
            />
            <span className="text-xs text-outline">{bodyUnitLabel}</span>
          </div>
        ) : canEditWeight || isManaged ? (
          <button
            type="button"
            className="flex items-center gap-1 font-bold hover:text-primary transition-colors"
            onClick={startEditingWeight}
          >
            {displayWeightStr ?? "Set weight"}
            <Pencil className="size-3 text-outline" />
          </button>
        ) : (
          displayWeightStr && <span className="font-bold">{displayWeightStr}</span>
        )}

        {isManaged && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={startEditingPet}
            title={`Edit ${member.name}`}
          >
            <Pencil className="size-3 text-outline" />
          </Button>
        )}
      </div>
    </div>
  );
}
