"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useHousehold, useUpdateHousehold } from "@/hooks/use-household";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { CategoryManager } from "@/components/closet/category-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_SETTINGS, resolveSettings } from "@/lib/household-settings";
import { gramsToLb, lbToGrams, displayWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { ArrowLeft, Loader2, LogOut, RotateCcw, Save, Settings2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import { fetchApi } from "@/lib/fetch";

type PackClassForm = {
  ultralight: string;
  lightweight: string;
  light: string;
  traditional: string;
};

type HumanPctForm = { ok: string; warn: string; max: string };
type PetPctForm = { ok: string; warn: string; max: string };

function gramsToLbStr(g: number): string {
  return gramsToLb(g).toFixed(1);
}

export function HouseholdSettingsPage() {
  const { data, isLoading } = useHousehold();
  const { data: categories } = useCategories();
  const { data: items } = useItems();
  const updateHousehold = useUpdateHousehold();
  const { unit } = useWeightUnit();
  const confirm = useConfirm();

  const resolved = useMemo(() => resolveSettings(data?.household?.settings), [data]);

  const [packClass, setPackClass] = useState<PackClassForm>(() => ({
    ultralight: gramsToLbStr(resolved.packClassGrams.ultralight),
    lightweight: gramsToLbStr(resolved.packClassGrams.lightweight),
    light: gramsToLbStr(resolved.packClassGrams.light),
    traditional: gramsToLbStr(resolved.packClassGrams.traditional),
  }));
  const [human, setHuman] = useState<HumanPctForm>(() => ({
    ok: String(resolved.humanCarryPercent.ok),
    warn: String(resolved.humanCarryPercent.warn),
    max: String(resolved.humanCarryPercent.max),
  }));
  const [pet, setPet] = useState<PetPctForm>(() => ({
    ok: String(resolved.petCarryPercent.ok),
    warn: String(resolved.petCarryPercent.warn),
    max: String(resolved.petCarryPercent.max),
  }));
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-outline" />
      </div>
    );
  }
  if (!data?.household) return null;

  function parseForm() {
    const packClassGrams = {
      ultralight: lbToGrams(parseFloat(packClass.ultralight)),
      lightweight: lbToGrams(parseFloat(packClass.lightweight)),
      light: lbToGrams(parseFloat(packClass.light)),
      traditional: lbToGrams(parseFloat(packClass.traditional)),
    };
    const humanCarryPercent = {
      ok: parseFloat(human.ok),
      warn: parseFloat(human.warn),
      max: parseFloat(human.max),
    };
    const petCarryPercent = {
      ok: parseFloat(pet.ok),
      warn: parseFloat(pet.warn),
      max: parseFloat(pet.max),
    };
    return { packClassGrams, humanCarryPercent, petCarryPercent };
  }

  function validate(): string | null {
    const { packClassGrams, humanCarryPercent, petCarryPercent } = parseForm();
    const tiers = [
      packClassGrams.ultralight,
      packClassGrams.lightweight,
      packClassGrams.light,
      packClassGrams.traditional,
    ];
    if (tiers.some((n) => !Number.isFinite(n) || n <= 0))
      return "Pack-class values must be positive numbers";
    for (let i = 1; i < tiers.length; i++) {
      if (tiers[i] <= tiers[i - 1]) return "Pack-class tiers must be strictly increasing";
    }
    if (humanCarryPercent.warn <= humanCarryPercent.ok)
      return "Human carry: warn % must be greater than ok %";
    if (humanCarryPercent.max <= humanCarryPercent.warn)
      return "Human carry: max % must be greater than warn %";
    if (petCarryPercent.warn <= petCarryPercent.ok)
      return "Pet carry: warn % must be greater than ok %";
    if (petCarryPercent.max <= petCarryPercent.warn)
      return "Pet carry: max % must be greater than warn %";
    return null;
  }

  function handleSave() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    updateHousehold.mutate(
      { settings: parseForm() },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
      }
    );
  }

  async function handleLeaveHousehold() {
    if (!data?.household) return;
    const ok = await confirm({
      title: `Leave "${data.household.name}"?`,
      description:
        "Your personal items and the pets/kids you manage come with you. Shared household gear and trips stay with the household. You can join or create another household right after.",
      confirmLabel: "Leave Household",
      destructive: true,
    });
    if (!ok) return;
    try {
      await fetchApi("/api/household/leave", { method: "POST" });
      window.location.href = "/app";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to leave household");
    }
  }

  function handleReset() {
    setPackClass({
      ultralight: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.ultralight),
      lightweight: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.lightweight),
      light: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.light),
      traditional: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.traditional),
    });
    setHuman({
      ok: String(DEFAULT_SETTINGS.humanCarryPercent.ok),
      warn: String(DEFAULT_SETTINGS.humanCarryPercent.warn),
      max: String(DEFAULT_SETTINGS.humanCarryPercent.max),
    });
    setPet({
      ok: String(DEFAULT_SETTINGS.petCarryPercent.ok),
      warn: String(DEFAULT_SETTINGS.petCarryPercent.warn),
      max: String(DEFAULT_SETTINGS.petCarryPercent.max),
    });
    toast("Reset to defaults. Press Save to apply.", {
      action: { label: "Save now", onClick: handleSave },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
      <header className="space-y-3">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs text-outline hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Settings2 className="size-6 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Household settings</h1>
        </div>
        <p className="text-outline">
          Tune the rules for <span className="font-bold">{data.household.name}</span>.
        </p>
      </header>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Pack class tiers</h2>
          <p className="text-sm text-outline mt-1">
            Base weight (lb) cut-offs for Ultralight → Lightweight → Light → Traditional → Heavy.
            Each tier must be strictly greater than the previous.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PackTierInput
            label="Ultralight <"
            value={packClass.ultralight}
            onChange={(v) => setPackClass((s) => ({ ...s, ultralight: v }))}
          />
          <PackTierInput
            label="Lightweight <"
            value={packClass.lightweight}
            onChange={(v) => setPackClass((s) => ({ ...s, lightweight: v }))}
          />
          <PackTierInput
            label="Light <"
            value={packClass.light}
            onChange={(v) => setPackClass((s) => ({ ...s, light: v }))}
          />
          <PackTierInput
            label="Traditional <"
            value={packClass.traditional}
            onChange={(v) => setPackClass((s) => ({ ...s, traditional: v }))}
          />
        </div>
        <p className="text-[11px] text-outline">
          Everything at or above <span className="font-mono">{packClass.traditional} lb</span> is
          classified Heavy.
        </p>
      </section>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Human carry thresholds</h2>
          <p className="text-sm text-outline mt-1">
            Total carried as % of body weight. Four tiers:{" "}
            <span className="font-bold text-primary">Comfortable</span> →{" "}
            <span className="font-bold text-foreground">OK</span> →{" "}
            <span className="font-bold text-secondary">Warn</span> →{" "}
            <span className="font-bold text-destructive">Overloaded</span>.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PercentInput
            label="OK ≤"
            value={human.ok}
            onChange={(v) => setHuman((s) => ({ ...s, ok: v }))}
          />
          <PercentInput
            label="Warn ≤"
            value={human.warn}
            onChange={(v) => setHuman((s) => ({ ...s, warn: v }))}
          />
          <PercentInput
            label="Max ≤"
            value={human.max}
            onChange={(v) => setHuman((s) => ({ ...s, max: v }))}
          />
        </div>
      </section>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Pet carry thresholds</h2>
          <p className="text-sm text-outline mt-1">
            Dogs typically safely carry 10-20% of body weight. Use your vet&apos;s guidance if
            available.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PercentInput
            label="OK ≤"
            value={pet.ok}
            onChange={(v) => setPet((s) => ({ ...s, ok: v }))}
          />
          <PercentInput
            label="Warn ≤"
            value={pet.warn}
            onChange={(v) => setPet((s) => ({ ...s, warn: v }))}
          />
          <PercentInput
            label="Max ≤"
            value={pet.max}
            onChange={(v) => setPet((s) => ({ ...s, max: v }))}
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={updateHousehold.isPending}
          className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl"
        >
          <Save className="size-4" data-icon="inline-start" />
          {updateHousehold.isPending ? "Saving…" : "Save settings"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="size-4" data-icon="inline-start" />
          Reset to defaults
        </Button>
      </div>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              Gear categories
            </h2>
            <p className="text-sm text-outline mt-1">
              Shared across everyone in the household. Changes here affect every closet tab.
            </p>
          </div>
          <Button variant="outline" onClick={() => setCategoryManagerOpen(true)}>
            Manage categories
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {(categories ?? []).map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-low px-3 py-1 text-xs"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
      </section>

      <CategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={categories ?? []}
        items={items ?? []}
      />

      {/* Helpful reference in the viewer's preferred unit */}
      <p className="text-[11px] text-outline text-center">
        Current Ultralight cap in your display unit:{" "}
        <span className="font-mono">
          {displayWeight(lbToGrams(parseFloat(packClass.ultralight) || 0), unit)}
        </span>
      </p>

      <section className="rounded-xl bg-card p-6 border border-destructive/20 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-destructive">Danger zone</h2>
          <p className="text-sm text-outline mt-1">
            Leave {data.household.name}. Your personal gear and any pets/kids you manage come with
            you — shared household gear and trips stay behind. You can join or create another
            household right after.
          </p>
        </div>
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
    </div>
  );
}

function PackTierInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-outline">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-right"
        />
        <span className="text-xs text-outline">lb</span>
      </div>
    </div>
  );
}

function PercentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-outline">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-right"
        />
        <span className="text-xs text-outline">%</span>
      </div>
    </div>
  );
}
