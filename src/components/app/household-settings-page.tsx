"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useHousehold, useUpdateHousehold } from "@/hooks/use-household";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { CategoryEditor } from "@/components/closet/category-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMember } from "@/hooks/use-household";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useUpdateProfile } from "@/hooks/use-user-preferences";
import { Pencil } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { DEFAULT_SETTINGS, resolveSettings } from "@/lib/household-settings";
import { gramsToLb, lbToGrams } from "@/lib/weight";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  LogOut,
  RotateCcw,
  Settings2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import { fetchApi } from "@/lib/fetch";
import { TierSlider, type TierSegment } from "@/components/app/tier-slider";

type PackClassForm = {
  ultralight: string;
  lightweight: string;
  traditional: string;
};

type HumanPctForm = { ok: string; warn: string; max: string };
type PetPctForm = { ok: string; warn: string; max: string };

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Which settings section the user most recently touched. Drives where the
 * Saving/Saved/Error pill renders so the feedback sits next to the section
 * header they just changed instead of floating in the corner.
 */
type ActiveSection = "name" | "pack" | "human" | "pet" | "reset" | null;

// Pack class has 4 tiers and 3 boundaries, so the slider shows four coloured
// regions with a draggable thumb at each internal boundary.
const PACK_SEGMENTS: TierSegment[] = [
  { label: "Ultralight", tone: "green" },
  { label: "Lightweight", tone: "yellow" },
  { label: "Traditional", tone: "orange" },
  { label: "Heavy", tone: "red" },
];

// Carry thresholds share one 4-tier scale for both humans and pets.
const CARRY_SEGMENTS: TierSegment[] = [
  { label: "Comfortable", tone: "green" },
  { label: "OK", tone: "yellow" },
  { label: "Warn", tone: "orange" },
  { label: "Overloaded", tone: "red" },
];

const AUTOSAVE_DEBOUNCE_MS = 500;

function gramsToLbStr(g: number): string {
  return gramsToLb(g).toFixed(1);
}

function parseNumericOr(s: string, fallback: number): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export function HouseholdSettingsPage() {
  const { data, isLoading } = useHousehold();
  const { data: categories } = useCategories();
  const { data: items } = useItems();
  const updateHousehold = useUpdateHousehold();
  const confirm = useConfirm();

  const resolved = useMemo(() => resolveSettings(data?.household?.settings), [data]);

  const [name, setName] = useState<string>(data?.household?.name ?? "");
  // Seeded from the query on first render; we intentionally do not resync
  // on refetch to avoid clobbering mid-edit text. Initial render is fine
  // because the parent returns early while isLoading.
  const [packClass, setPackClass] = useState<PackClassForm>(() => ({
    ultralight: gramsToLbStr(resolved.packClassGrams.ultralight),
    lightweight: gramsToLbStr(resolved.packClassGrams.lightweight),
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

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Auto-hides the "Saved" pill a couple seconds after a successful save.
  const savedDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror so the debounced save always reads the most recent form values
  // without waiting for a re-render to flow the state into the closure.
  // Initialized once from the same resolved defaults the useState hooks read;
  // the update handlers below keep it in sync — never write to it in render.
  const formRef = useRef({ packClass, human, pet });
  const nameSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-outline" />
      </div>
    );
  }
  if (!data?.household) return null;

  function parseForm(snap: { packClass: PackClassForm; human: HumanPctForm; pet: PetPctForm }) {
    return {
      packClassGrams: {
        ultralight: lbToGrams(parseFloat(snap.packClass.ultralight)),
        lightweight: lbToGrams(parseFloat(snap.packClass.lightweight)),
        traditional: lbToGrams(parseFloat(snap.packClass.traditional)),
      },
      humanCarryPercent: {
        ok: parseFloat(snap.human.ok),
        warn: parseFloat(snap.human.warn),
        max: parseFloat(snap.human.max),
      },
      petCarryPercent: {
        ok: parseFloat(snap.pet.ok),
        warn: parseFloat(snap.pet.warn),
        max: parseFloat(snap.pet.max),
      },
    };
  }

  function validate(parsed: ReturnType<typeof parseForm>): string | null {
    const tiers = [
      parsed.packClassGrams.ultralight,
      parsed.packClassGrams.lightweight,
      parsed.packClassGrams.traditional,
    ];
    if (tiers.some((n) => !Number.isFinite(n) || n <= 0))
      return "Pack-class values must be positive numbers";
    for (let i = 1; i < tiers.length; i++) {
      if (tiers[i] <= tiers[i - 1]) return "Pack-class tiers must be strictly increasing";
    }
    const humanTiers = [
      parsed.humanCarryPercent.ok,
      parsed.humanCarryPercent.warn,
      parsed.humanCarryPercent.max,
    ];
    if (humanTiers.some((n) => !Number.isFinite(n) || n < 0))
      return "Human carry %s must be non-negative numbers";
    if (parsed.humanCarryPercent.warn <= parsed.humanCarryPercent.ok)
      return "Human carry: warn % must be greater than ok %";
    if (parsed.humanCarryPercent.max <= parsed.humanCarryPercent.warn)
      return "Human carry: max % must be greater than warn %";
    const petTiers = [
      parsed.petCarryPercent.ok,
      parsed.petCarryPercent.warn,
      parsed.petCarryPercent.max,
    ];
    if (petTiers.some((n) => !Number.isFinite(n) || n < 0))
      return "Pet carry %s must be non-negative numbers";
    if (parsed.petCarryPercent.warn <= parsed.petCarryPercent.ok)
      return "Pet carry: warn % must be greater than ok %";
    if (parsed.petCarryPercent.max <= parsed.petCarryPercent.warn)
      return "Pet carry: max % must be greater than warn %";
    return null;
  }

  function scheduleAutosave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const parsed = parseForm(formRef.current);
      const err = validate(parsed);
      if (err) {
        setSaveStatus("error");
        setSaveError(err);
        return;
      }
      setSaveError(null);
      setSaveStatus("saving");
      if (savedDismissTimerRef.current) {
        clearTimeout(savedDismissTimerRef.current);
        savedDismissTimerRef.current = null;
      }
      updateHousehold.mutate(
        { settings: parsed },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            if (savedDismissTimerRef.current) clearTimeout(savedDismissTimerRef.current);
            savedDismissTimerRef.current = setTimeout(() => {
              // Only clear if still showing "saved" — another save in flight
              // or a subsequent error shouldn't be clobbered back to idle.
              // activeSection stays set so the next edit resumes in place.
              setSaveStatus((s) => (s === "saved" ? "idle" : s));
            }, 2500);
          },
          onError: (e) => {
            setSaveStatus("error");
            setSaveError(e instanceof Error ? e.message : "Failed to save");
          },
        }
      );
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  function updatePackAll(next: PackClassForm) {
    setPackClass(next);
    formRef.current.packClass = next;
    setActiveSection("pack");
    scheduleAutosave();
  }
  function updateHumanAll(next: HumanPctForm) {
    setHuman(next);
    formRef.current.human = next;
    setActiveSection("human");
    scheduleAutosave();
  }
  function updatePetAll(next: PetPctForm) {
    setPet(next);
    formRef.current.pet = next;
    setActiveSection("pet");
    scheduleAutosave();
  }

  function updateName(next: string) {
    setName(next);
    setActiveSection("name");
    if (nameSaveTimerRef.current) clearTimeout(nameSaveTimerRef.current);
    nameSaveTimerRef.current = setTimeout(() => {
      const trimmed = next.trim();
      if (!trimmed) {
        setSaveStatus("error");
        setSaveError("Name is required");
        return;
      }
      if (trimmed === data?.household?.name) return;
      setSaveError(null);
      setSaveStatus("saving");
      if (savedDismissTimerRef.current) {
        clearTimeout(savedDismissTimerRef.current);
        savedDismissTimerRef.current = null;
      }
      updateHousehold.mutate(
        { name: trimmed },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            if (savedDismissTimerRef.current) clearTimeout(savedDismissTimerRef.current);
            savedDismissTimerRef.current = setTimeout(() => {
              setSaveStatus((s) => (s === "saved" ? "idle" : s));
            }, 2500);
          },
          onError: (e) => {
            setSaveStatus("error");
            setSaveError(e instanceof Error ? e.message : "Failed to save");
          },
        }
      );
    }, AUTOSAVE_DEBOUNCE_MS);
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
    const resetPack = {
      ultralight: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.ultralight),
      lightweight: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.lightweight),
      traditional: gramsToLbStr(DEFAULT_SETTINGS.packClassGrams.traditional),
    };
    const resetHuman = {
      ok: String(DEFAULT_SETTINGS.humanCarryPercent.ok),
      warn: String(DEFAULT_SETTINGS.humanCarryPercent.warn),
      max: String(DEFAULT_SETTINGS.humanCarryPercent.max),
    };
    const resetPet = {
      ok: String(DEFAULT_SETTINGS.petCarryPercent.ok),
      warn: String(DEFAULT_SETTINGS.petCarryPercent.warn),
      max: String(DEFAULT_SETTINGS.petCarryPercent.max),
    };
    setPackClass(resetPack);
    setHuman(resetHuman);
    setPet(resetPet);
    formRef.current = { packClass: resetPack, human: resetHuman, pet: resetPet };
    setActiveSection("reset");
    scheduleAutosave();
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
        <div className="flex flex-wrap items-center gap-3">
          <Settings2 className="size-6 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Household settings</h1>
        </div>
        <p className="text-outline">
          Tune the rules for <span className="font-bold">{data.household.name}</span>. Changes save
          automatically.
        </p>
      </header>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Household name</h2>
            <SectionSavePill
              status={saveStatus}
              error={saveError}
              visible={activeSection === "name"}
            />
          </div>
          <p className="text-sm text-outline mt-1">
            Shown on the dashboard header and anywhere the household is named.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="household-name">Name</Label>
          <Input
            id="household-name"
            value={name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="The Freeman family"
            maxLength={100}
          />
        </div>
      </section>

      <MembersSection />

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Pack class tiers</h2>
            <SectionSavePill
              status={saveStatus}
              error={saveError}
              visible={activeSection === "pack"}
            />
          </div>
          <p className="text-sm text-outline mt-1">
            Base weight is your pack minus consumables and worn items — the standard benchmark
            backpackers optimize. These cut-offs decide the class shown on each pack in the
            workspace and on trip cards.
          </p>
        </div>
        <TierSlider
          segments={PACK_SEGMENTS}
          values={[
            parseNumericOr(packClass.ultralight, 0),
            parseNumericOr(packClass.lightweight, 0),
            parseNumericOr(packClass.traditional, 0),
          ]}
          min={0}
          max={40}
          step={0.5}
          suffix="lb"
          onChange={(vals) =>
            updatePackAll({
              ultralight: vals[0].toFixed(1),
              lightweight: vals[1].toFixed(1),
              traditional: vals[2].toFixed(1),
            })
          }
        />
      </section>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Human carry thresholds</h2>
            <SectionSavePill
              status={saveStatus}
              error={saveError}
              visible={activeSection === "human"}
            />
          </div>
          <p className="text-sm text-outline mt-1">
            Carry weight relative to body weight predicts how a pack will feel over long miles.
            These thresholds drive the color-coded %body-wt indicator on every pack.
          </p>
        </div>
        <TierSlider
          segments={CARRY_SEGMENTS}
          values={[
            parseNumericOr(human.ok, 0),
            parseNumericOr(human.warn, 0),
            parseNumericOr(human.max, 0),
          ]}
          min={10}
          max={30}
          step={1}
          suffix="%"
          onChange={(vals) =>
            updateHumanAll({
              ok: String(vals[0]),
              warn: String(vals[1]),
              max: String(vals[2]),
            })
          }
        />
      </section>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Pet carry thresholds</h2>
            <SectionSavePill
              status={saveStatus}
              error={saveError}
              visible={activeSection === "pet"}
            />
          </div>
          <p className="text-sm text-outline mt-1">
            Dogs have a narrower safe range than people. Common vet guidance is 10-20% of body
            weight depending on breed, age, and fitness — tune these for your pup.
          </p>
        </div>
        <TierSlider
          segments={CARRY_SEGMENTS}
          values={[
            parseNumericOr(pet.ok, 0),
            parseNumericOr(pet.warn, 0),
            parseNumericOr(pet.max, 0),
          ]}
          min={5}
          max={25}
          step={1}
          suffix="%"
          onChange={(vals) =>
            updatePetAll({
              ok: String(vals[0]),
              warn: String(vals[1]),
              max: String(vals[2]),
            })
          }
        />
      </section>

      <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            Gear categories
          </h2>
          <p className="text-sm text-outline mt-1">
            Shared across everyone in the household. Changes here affect every closet tab.
          </p>
        </div>
        <CategoryEditor categories={categories ?? []} items={items ?? []} />
      </section>

      <div className="flex items-center justify-end gap-3">
        <SectionSavePill
          status={saveStatus}
          error={saveError}
          visible={activeSection === "reset"}
        />
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="size-3.5" />
          Reset settings to defaults
        </Button>
      </div>

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

/**
 * Inline per-section save-status pill. Renders next to the section header the
 * user most recently edited (via `activeSection`) and auto-hides 2.5s after a
 * successful save. `visible={false}` or `status==="idle"` collapses to null so
 * other sections don't show stale pills.
 */
function SectionSavePill({
  status,
  error,
  visible,
}: {
  status: SaveStatus;
  error: string | null;
  visible: boolean;
}) {
  if (!visible || status === "idle") return null;
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-opacity";
  if (status === "saving") {
    return (
      <span
        className={`${base} bg-surface-high/80 border-outline-variant/30 text-outline`}
        role="status"
      >
        <Loader2 className="size-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span
        className={`${base} bg-green-500/15 border-green-500/40 text-green-600 dark:text-green-400`}
        role="status"
      >
        <Check className="size-3" />
        Saved
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-destructive/10 border-destructive/40 text-destructive max-w-xs`}
      role="alert"
      title={error ?? undefined}
    >
      <CircleAlert className="size-3 shrink-0" />
      <span className="truncate">{error ?? "Couldn't save"}</span>
    </span>
  );
}

// ── Members section ──────────────────────────────────────────────────────────

/**
 * Per-member list with inline body weight editing. Same edit affordance as
 * the dashboard (click to edit, Enter to commit, click-outside warns when
 * dirty) so the two surfaces stay in sync. Parity feature — putting member
 * weight edit in Household Settings keeps member-ish data in one place with
 * Add Pet.
 */
function MembersSection() {
  const { data } = useHousehold();
  const updateMember = useUpdateMember();
  const updateProfile = useUpdateProfile();
  const { unit } = useWeightUnit();

  if (!data) return null;
  const members = (data.members ?? []) as Array<{
    id: string;
    name: string;
    role: string;
    email?: string | null;
    bodyWeightKg?: number | null;
    breed?: string | null;
  }>;

  return (
    <section className="rounded-xl bg-card p-6 border border-outline-variant/10 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Members &amp; body weight</h2>
        <p className="text-sm text-outline mt-1">
          Body weight drives the % body-wt ramp on every pack. Adults edit their own; pets &amp;
          children are editable by any adult in the household.
        </p>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <MemberWeightRow
            key={member.id}
            member={member}
            unit={unit}
            onUpdate={(kg) => {
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
          />
        ))}
      </div>
    </section>
  );
}

function MemberWeightRow({
  member,
  unit,
  onUpdate,
}: {
  member: {
    id: string;
    name: string;
    role: string;
    email?: string | null;
    bodyWeightKg?: number | null;
    breed?: string | null;
  };
  unit: string;
  onUpdate: (kg: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [dirtyError, setDirtyError] = useState(false);

  const isMetricBody = unit === "g" || unit === "kg" || unit === "metric";
  const label = isMetricBody ? "kg" : "lb";

  function toKg(raw: string): number | null {
    const n = parseFloat(raw);
    if (Number.isNaN(n) || n <= 0) return null;
    return isMetricBody ? Math.round(n) : Math.round(n / 2.20462);
  }
  function dirty(): boolean {
    const kg = toKg(value);
    return kg !== null && kg !== (member.bodyWeightKg ?? null);
  }

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (!editing) return;
    if (dirty()) setDirtyError(true);
    else setEditing(false);
  }, editing);

  function startEdit() {
    if (isMetricBody) {
      setValue(member.bodyWeightKg?.toString() ?? "");
    } else {
      setValue(member.bodyWeightKg ? (member.bodyWeightKg * 2.20462).toFixed(0) : "");
    }
    setDirtyError(false);
    setEditing(true);
  }
  function commit() {
    const kg = toKg(value);
    setEditing(false);
    setDirtyError(false);
    if (kg !== null && kg !== (member.bodyWeightKg ?? null)) onUpdate(kg);
  }

  const display = member.bodyWeightKg
    ? isMetricBody
      ? `${member.bodyWeightKg} kg`
      : `${Math.round(member.bodyWeightKg * 2.20462)} lb`
    : null;

  // Adults without email accounts (e.g., imported) and managed members can
  // all have their weight edited here.
  const canEdit = member.role !== "adult" || !!member.email;

  return (
    <div className="group flex items-center justify-between rounded-lg bg-surface-low px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary-container/20 text-primary text-xs font-bold">
          {member.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-bold">{member.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-outline">
            {member.role}
            {member.breed ? ` · ${member.breed}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit && editing ? (
          <div
            ref={ref}
            className={`flex items-center gap-1 ${dirtyError ? "rounded-md ring-2 ring-destructive/60 px-1" : ""}`}
          >
            <Input
              className="h-8 w-20 text-sm tabular-nums text-right"
              type="number"
              min="0"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setDirtyError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
            />
            <span className="text-xs text-outline">{label}</span>
          </div>
        ) : canEdit ? (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors"
          >
            {display ?? "Set weight"}
            <Pencil className="size-3 text-outline" />
          </button>
        ) : (
          display && <span className="text-sm font-bold">{display}</span>
        )}
      </div>
    </div>
  );
}
