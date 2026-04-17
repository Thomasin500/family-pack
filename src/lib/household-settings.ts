import type { HouseholdSettings } from "@/db/schema";
import { lbToGrams } from "@/lib/weight";

/**
 * Default thresholds — used when a household hasn't set its own settings.
 * Values match the previously hard-coded roadmap/pack-class table.
 */
export const DEFAULT_SETTINGS: Required<HouseholdSettings> = {
  packClassGrams: {
    ultralight: lbToGrams(10),
    lightweight: lbToGrams(20),
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

/**
 * Merge user-provided settings on top of defaults. Two legacy shapes are
 * migrated transparently so existing households keep their customizations:
 *   - v1 `{ ultralight, lightweight, light, traditional }` — had a 5th tier
 *     called "Light" between Lightweight and Traditional. Collapsed by mapping
 *     v1's `light` bound onto the new `lightweight` bound.
 *   - v2 `{ hyperlight, ultralight, lightweight, traditional }` — had a 5th
 *     tier called "Hyperlight" below Ultralight. Collapsed by dropping the
 *     `hyperlight` bound; v2's `ultralight` becomes the new `ultralight` bound.
 */
export function resolveSettings(
  settings: HouseholdSettings | null | undefined
): Required<HouseholdSettings> {
  const rawPack = (settings?.packClassGrams ?? {}) as Record<string, number | undefined>;
  const hasLight = "light" in rawPack;
  const hasHyper = "hyperlight" in rawPack;
  const packClassGrams = hasLight
    ? {
        ultralight: rawPack.ultralight ?? DEFAULT_SETTINGS.packClassGrams.ultralight,
        lightweight: rawPack.light ?? DEFAULT_SETTINGS.packClassGrams.lightweight,
        traditional: rawPack.traditional ?? DEFAULT_SETTINGS.packClassGrams.traditional,
      }
    : hasHyper
      ? {
          ultralight: rawPack.ultralight ?? DEFAULT_SETTINGS.packClassGrams.ultralight,
          lightweight: rawPack.lightweight ?? DEFAULT_SETTINGS.packClassGrams.lightweight,
          traditional: rawPack.traditional ?? DEFAULT_SETTINGS.packClassGrams.traditional,
        }
      : {
          ultralight: rawPack.ultralight ?? DEFAULT_SETTINGS.packClassGrams.ultralight,
          lightweight: rawPack.lightweight ?? DEFAULT_SETTINGS.packClassGrams.lightweight,
          traditional: rawPack.traditional ?? DEFAULT_SETTINGS.packClassGrams.traditional,
        };
  return {
    packClassGrams,
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

export type PackClass = "ultralight" | "lightweight" | "traditional" | "heavy";

export function packClass(
  baseWeightGrams: number,
  settings: Required<HouseholdSettings>["packClassGrams"]
): PackClass {
  if (baseWeightGrams < settings.ultralight) return "ultralight";
  if (baseWeightGrams < settings.lightweight) return "lightweight";
  if (baseWeightGrams < settings.traditional) return "traditional";
  return "heavy";
}

/**
 * Pack-class colors share the carry-warning green→red ramp so "lighter is
 * better" reads the same across the app.
 */
export function packClassColor(cls: PackClass): string {
  switch (cls) {
    case "ultralight":
      return "text-green-600 dark:text-green-400";
    case "lightweight":
      return "text-yellow-600 dark:text-yellow-400";
    case "traditional":
      return "text-orange-600 dark:text-orange-400";
    case "heavy":
      return "text-red-600 dark:text-red-400";
  }
}

export function packClassLabel(cls: PackClass): string {
  return cls === "ultralight"
    ? "Ultralight"
    : cls === "lightweight"
      ? "Lightweight"
      : cls === "traditional"
        ? "Traditional"
        : "Heavy";
}
