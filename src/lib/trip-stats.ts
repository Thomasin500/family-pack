import type { HouseholdSettings, Trip, TripPack, TripPackItem } from "@/types";
import { bodyWeightPercent } from "@/lib/weight";
import {
  packClass,
  packClassLabel,
  petClass,
  petClassLabel,
  resolveSettings,
  type PackClass,
  type PetClass,
} from "@/lib/household-settings";

export interface CategoryStat {
  categoryId: string | null;
  name: string;
  color: string;
  grams: number;
}

export interface PackStats {
  packId: string;
  userId: string;
  name: string;
  role: "adult" | "child" | "pet";
  bodyWeightKg: number | null;
  itemCount: number;
  baseGrams: number;
  consumableGrams: number;
  wornGrams: number;
  carriedGrams: number;
  skinOutGrams: number;
  personalGrams: number;
  sharedGrams: number;
  carryingForGrams: number;
  bodyWeightPct: number | null;
  packClassLabel: string | null;
  packClassKey: PackClass | PetClass | null;
  heaviestItem: { name: string; grams: number } | null;
  categories: CategoryStat[];
}

export interface SharedBalanceEntry {
  packId: string;
  userId: string;
  name: string;
  grams: number;
  pct: number;
}

export interface TripStats {
  packs: PackStats[];
  householdCarriedGrams: number;
  householdBaseGrams: number;
  householdSkinOutGrams: number;
  sharedTotalGrams: number;
  sharedUnassignedGrams: number;
  sharedBalance: SharedBalanceEntry[];
  memberCount: number;
}

const UNCATEGORIZED_COLOR = "#6b7280";

function gramsOf(pi: TripPackItem): number {
  const weight = pi.item?.weightGrams ?? 0;
  return weight * (pi.quantity ?? 1);
}

function classifyPack(
  role: "adult" | "child" | "pet",
  baseGrams: number,
  carriedGrams: number,
  bodyWeightKg: number | null,
  settings: ReturnType<typeof resolveSettings>
): { key: PackClass | PetClass | null; label: string | null } {
  if (role === "pet") {
    if (!bodyWeightKg || bodyWeightKg <= 0 || carriedGrams <= 0) return { key: null, label: null };
    const percent = (carriedGrams / (bodyWeightKg * 1000)) * 100;
    const cls = petClass(percent, settings.petCarryPercent);
    return { key: cls, label: petClassLabel(cls) };
  }
  if (baseGrams <= 0) return { key: null, label: null };
  const cls = packClass(baseGrams, settings.packClassGrams);
  return { key: cls, label: packClassLabel(cls) };
}

function computePackStats(pack: TripPack, settings: ReturnType<typeof resolveSettings>): PackStats {
  const items = pack.packItems ?? [];
  const user = pack.user;

  const categoryMap = new Map<string, CategoryStat>();
  let baseGrams = 0;
  let consumableGrams = 0;
  let wornGrams = 0;
  let personalGrams = 0;
  let sharedGrams = 0;
  let carryingForGrams = 0;
  let heaviest: { name: string; grams: number } | null = null;

  for (const pi of items) {
    const item = pi.item;
    if (!item) continue;
    const w = gramsOf(pi);
    const isWorn = pi.isWornOverride ?? item.isWorn ?? false;
    const isConsumable = pi.isConsumableOverride ?? item.isConsumable ?? false;

    if (isWorn) {
      wornGrams += w;
    } else {
      if (isConsumable) consumableGrams += w;
      else baseGrams += w;

      if (item.ownerType === "shared") sharedGrams += w;
      else personalGrams += w;

      // "Carrying for" — personal gear you're carrying owned by someone else.
      if (item.ownerType === "personal" && pi.ownedByUserId && pi.ownedByUserId !== pack.userId) {
        carryingForGrams += w;
      }

      // Category aggregation — only counts pack-weight (not worn) so the
      // chart matches the "total carried" metric users already see.
      const catId = item.categoryId ?? item.category?.id ?? null;
      const catKey = catId ?? "__uncategorized";
      const existing = categoryMap.get(catKey);
      if (existing) {
        existing.grams += w;
      } else {
        categoryMap.set(catKey, {
          categoryId: catId,
          name: item.category?.name ?? "Uncategorized",
          color: item.category?.color ?? UNCATEGORIZED_COLOR,
          grams: w,
        });
      }

      if (!heaviest || w > heaviest.grams) {
        heaviest = { name: item.name, grams: w };
      }
    }
  }

  const carriedGrams = baseGrams + consumableGrams;
  const skinOutGrams = carriedGrams + wornGrams;
  const bodyWeightPct =
    user?.bodyWeightKg && user.bodyWeightKg > 0
      ? bodyWeightPercent(carriedGrams, user.bodyWeightKg)
      : null;

  const { key: classKey, label: classLabel } = classifyPack(
    user?.role ?? "adult",
    baseGrams,
    carriedGrams,
    user?.bodyWeightKg ?? null,
    settings
  );

  return {
    packId: pack.id,
    userId: pack.userId,
    name: user?.name ?? "—",
    role: user?.role ?? "adult",
    bodyWeightKg: user?.bodyWeightKg ?? null,
    itemCount: items.length,
    baseGrams,
    consumableGrams,
    wornGrams,
    carriedGrams,
    skinOutGrams,
    personalGrams,
    sharedGrams,
    carryingForGrams,
    bodyWeightPct,
    packClassLabel: classLabel,
    packClassKey: classKey,
    heaviestItem: heaviest,
    categories: Array.from(categoryMap.values()).sort((a, b) => b.grams - a.grams),
  };
}

/**
 * Compute every stat the Phase 5 UI needs from a single trip. Pure function:
 * takes (trip, settings), returns a serializable snapshot. Consumed by the
 * stats panel, the pack-level chips, the insights section, and smart tags.
 */
export function computeTripStats(
  trip: Trip | null | undefined,
  householdSettings: HouseholdSettings | null | undefined
): TripStats {
  const settings = resolveSettings(householdSettings);
  const packs = (trip?.packs ?? []).map((p) => computePackStats(p, settings));

  const householdBaseGrams = packs.reduce((s, p) => s + p.baseGrams, 0);
  const householdCarriedGrams = packs.reduce((s, p) => s + p.carriedGrams, 0);
  const householdSkinOutGrams = packs.reduce((s, p) => s + p.skinOutGrams, 0);
  const sharedTotalGrams = packs.reduce((s, p) => s + p.sharedGrams, 0);

  const sharedBalance: SharedBalanceEntry[] = packs
    .filter((p) => p.sharedGrams > 0)
    .map((p) => ({
      packId: p.packId,
      userId: p.userId,
      name: p.name,
      grams: p.sharedGrams,
      pct: sharedTotalGrams > 0 ? (p.sharedGrams / sharedTotalGrams) * 100 : 0,
    }))
    .sort((a, b) => b.grams - a.grams);

  return {
    packs,
    householdBaseGrams,
    householdCarriedGrams,
    householdSkinOutGrams,
    sharedTotalGrams,
    sharedUnassignedGrams: 0,
    sharedBalance,
    memberCount: packs.length,
  };
}
