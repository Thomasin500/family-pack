"use client";

import { useState } from "react";
import Link from "next/link";
import { useHousehold, useUpdateMember } from "@/hooks/use-household";
import { useUpdateProfile } from "@/hooks/use-user-preferences";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, PawPrint, Backpack, Map, Pencil } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { PetDialog } from "./pet-dialog";
import { BaseWeightTrend } from "./base-weight-trend";

export function Dashboard() {
  const { data, isLoading } = useHousehold();
  const updateMember = useUpdateMember();
  const updateProfile = useUpdateProfile();
  const { unit } = useWeightUnit();

  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
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

  const editingPet = editingPetId ? members.find((m: any) => m.id === editingPetId) : undefined;

  function openAddPet() {
    setEditingPetId(null);
    setPetDialogOpen(true);
  }

  function openEditPet(id: string) {
    setEditingPetId(id);
    setPetDialogOpen(true);
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

          {/* Base-weight trend across trips — hidden until there are ≥ 2 trips */}
          <BaseWeightTrend />
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-8">
          {/* Household Members */}
          <section className="rounded-xl bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
                Household
              </h3>
              <Button variant="ghost" size="sm" onClick={openAddPet} className="text-xs gap-1.5">
                <PawPrint className="size-3.5" />
                Add pet
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
                  onEditPet={() => openEditPet(member.id)}
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
        </div>
      </div>

      <PetDialog
        open={petDialogOpen}
        onOpenChange={(open) => {
          setPetDialogOpen(open);
          if (!open) setEditingPetId(null);
        }}
        pet={editingPet}
      />
    </div>
  );
}

function MemberRow({
  member,
  unit,
  onUpdateWeight,
  onEditPet,
}: {
  member: any;
  unit: string;
  onUpdateWeight: (kg: number) => void;
  onEditPet: () => void;
}) {
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [weightDirtyError, setWeightDirtyError] = useState(false);

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

  const weightRef = useClickOutside<HTMLDivElement>(() => {
    if (!editingWeight) return;
    if (isWeightDirty()) {
      setWeightDirtyError(true);
    } else {
      setEditingWeight(false);
    }
  }, editingWeight);

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

  const displayWeightStr = member.bodyWeightKg
    ? isMetricBody
      ? `${member.bodyWeightKg} kg`
      : `${Math.round(member.bodyWeightKg * 2.20462)} lb`
    : null;

  const canEditWeight = member.role === "adult" && member.email;
  const isPet = member.role === "pet";
  const isManaged = isPet || member.role === "child";

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
        {isManaged && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEditPet}
            title={`Edit ${member.name}`}
          >
            <Pencil className="size-3 text-outline" />
          </Button>
        )}

        <div className="flex justify-end items-center">
          {(canEditWeight || isManaged) && editingWeight ? (
            <div
              ref={weightRef}
              className={`flex items-center gap-1 ${weightDirtyError ? "rounded-md ring-2 ring-destructive/60 px-1" : ""}`}
            >
              <Input
                className="h-7 w-16 text-sm tabular-nums text-right"
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
        </div>
      </div>
    </div>
  );
}
