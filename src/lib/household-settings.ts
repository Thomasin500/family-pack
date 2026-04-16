import type { HouseholdSettings } from "@/db/schema";
import { lbToGrams } from "@/lib/weight";

/**
 * Default thresholds — used when a household hasn't set its own settings.
 * Values match the previously hard-coded roadmap/pack-class table.
 */
export const DEFAULT_SETTINGS: Required<HouseholdSettings> = {
  packClassGrams: {
    ultralight: lbToGrams(10),
    lightweight: lbToGrams(15),
    light: lbToGrams(20),
    traditional: lbToGrams(30),
  },
  humanCarryPercent: {
    ok: 15,
    warn: 20,
    max: 25,
  },
  petCarryPercent: {
    ok: 10,
    warn: 15,
    max: 20,
  },
};

/** Merge user-provided settings on top of defaults, per-section. */
export function resolveSettings(
  settings: HouseholdSettings | null | undefined
): Required<HouseholdSettings> {
  return {
    packClassGrams: { ...DEFAULT_SETTINGS.packClassGrams, ...(settings?.packClassGrams ?? {}) },
    humanCarryPercent: {
      ...DEFAULT_SETTINGS.humanCarryPercent,
      ...(settings?.humanCarryPercent ?? {}),
    },
    petCarryPercent: {
      ...DEFAULT_SETTINGS.petCarryPercent,
      ...(settings?.petCarryPercent ?? {}),
    },
  };
}

export type PackClass = "ultralight" | "lightweight" | "light" | "traditional" | "heavy";

export function packClass(
  baseWeightGrams: number,
  settings: Required<HouseholdSettings>["packClassGrams"]
): PackClass {
  if (baseWeightGrams < settings.ultralight) return "ultralight";
  if (baseWeightGrams < settings.lightweight) return "lightweight";
  if (baseWeightGrams < settings.light) return "light";
  if (baseWeightGrams < settings.traditional) return "traditional";
  return "heavy";
}

export function packClassColor(cls: PackClass): string {
  switch (cls) {
    case "ultralight":
      return "text-primary";
    case "lightweight":
      return "text-primary/80";
    case "light":
      return "text-foreground";
    case "traditional":
      return "text-secondary";
    case "heavy":
      return "text-destructive";
  }
}

export function packClassLabel(cls: PackClass): string {
  return cls === "ultralight"
    ? "Ultralight"
    : cls === "lightweight"
      ? "Lightweight"
      : cls === "light"
        ? "Light"
        : cls === "traditional"
          ? "Traditional"
          : "Heavy";
}
