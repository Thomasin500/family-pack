"use client";

import { useState } from "react";
import Link from "next/link";
import { useHousehold, useAddMember } from "@/hooks/use-household";
import { useUpdateProfile } from "@/hooks/use-user-preferences";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Copy, Check, PawPrint, Backpack, Map, Users, Plus, X } from "lucide-react";

function roleBadgeVariant(role: string) {
  switch (role) {
    case "adult":
      return "default" as const;
    case "child":
      return "secondary" as const;
    case "pet":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function Dashboard() {
  const { data, isLoading } = useHousehold();
  const addMember = useAddMember();
  const updateProfile = useUpdateProfile();
  const { unit } = useWeightUnit();

  const [showPetForm, setShowPetForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.household) return null;

  const { household, members } = data;

  function handleCopyInviteCode() {
    if (household.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{household.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Invite code:</span>
          <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
            {household.inviteCode}
          </code>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopyInviteCode}
            aria-label="Copy invite code"
          >
            {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Members section */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5" />
            Members
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPetForm(!showPetForm)}
            className="gap-1.5"
          >
            <PawPrint className="size-4" />
            Add Pet
          </Button>
        </div>

        {showPetForm && (
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add a Pet</CardTitle>
                <Button variant="ghost" size="icon-xs" onClick={() => setShowPetForm(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleAddPet}>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Name</Label>
                    <Input
                      id="pet-name"
                      placeholder="Buddy"
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
                {addMember.isError && (
                  <p className="mt-2 text-sm text-destructive">
                    {addMember.error?.message ?? "Failed to add pet."}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!petName.trim() || addMember.isPending}
                  className="gap-1.5"
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
              </CardFooter>
            </form>
          </Card>
        )}

        <div className="space-y-2">
          {members.map((member: any) => (
            <MemberRow
              key={member.id}
              member={member}
              unit={unit}
              onUpdateWeight={(kg) => {
                updateProfile.mutate(
                  { bodyWeightKg: kg },
                  { onSuccess: () => toast.success("Body weight updated") }
                );
              }}
            />
          ))}
          {members.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No members yet.</p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/app/closet" className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Backpack className="size-5" />
                  Gear Closet
                </CardTitle>
                <CardDescription>
                  Manage your family&apos;s gear inventory, weights, and categories.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/app/trips" className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Map className="size-5" />
                  Trips
                </CardTitle>
                <CardDescription>
                  Plan trips and build pack lists for your whole family.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

function MemberRow({
  member,
  unit,
  onUpdateWeight,
}: {
  member: any;
  unit: "imperial" | "metric";
  onUpdateWeight: (kg: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [weightValue, setWeightValue] = useState("");

  function startEditing() {
    if (unit === "metric") {
      setWeightValue(member.bodyWeightKg?.toString() ?? "");
    } else {
      const lbs = member.bodyWeightKg ? (member.bodyWeightKg * 2.20462).toFixed(0) : "";
      setWeightValue(lbs);
    }
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const parsed = parseFloat(weightValue);
    if (isNaN(parsed) || parsed <= 0) return;
    const kg = unit === "metric" ? Math.round(parsed) : Math.round(parsed / 2.20462);
    if (kg !== member.bodyWeightKg) {
      onUpdateWeight(kg);
    }
  }

  const displayWeight = member.bodyWeightKg
    ? unit === "metric"
      ? `${member.bodyWeightKg} kg`
      : `${Math.round(member.bodyWeightKg * 2.20462)} lb`
    : null;

  // Only the current user (adult, has email) can edit their own weight
  const canEdit = member.role === "adult" && member.email;

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="font-medium">{member.name}</span>
        <Badge variant={roleBadgeVariant(member.role)}>{member.role}</Badge>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {member.breed && <span>{member.breed}</span>}
        {canEdit && editing ? (
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-16 text-sm tabular-nums"
              type="number"
              min="0"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
            />
            <span className="text-xs">{unit === "metric" ? "kg" : "lb"}</span>
          </div>
        ) : canEdit ? (
          <button
            type="button"
            className="hover:underline decoration-dashed underline-offset-4 cursor-text"
            onClick={startEditing}
          >
            {displayWeight ?? `Set weight`}
          </button>
        ) : (
          displayWeight && <span>{displayWeight}</span>
        )}
      </div>
    </div>
  );
}
