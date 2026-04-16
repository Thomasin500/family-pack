import { DEFAULT_SETTINGS } from "@/lib/household-settings";
import type { HouseholdSettings } from "@/db/schema";

export type CarryStatus = "light" | "moderate" | "heavy" | "overloaded";

export interface CarryWarning {
  status: CarryStatus;
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<CarryStatus, { label: string; color: string }> = {
  light: { label: "Comfortable", color: "text-green-600 dark:text-green-400" },
  moderate: { label: "OK", color: "text-yellow-600 dark:text-yellow-400" },
  heavy: { label: "Warn", color: "text-orange-600 dark:text-orange-400" },
  overloaded: { label: "Overloaded", color: "text-red-600 dark:text-red-400" },
};

/**
 * Classify a carry % using household settings (or defaults). Four tiers for both
 * humans and pets now: Comfortable / OK / Warn / Overloaded.
 */
export function getCarryWarning(
  percent: number,
  role: "adult" | "child" | "pet",
  settings?: HouseholdSettings | null
): CarryWarning {
  const cfg =
    role === "pet"
      ? (settings?.petCarryPercent ?? DEFAULT_SETTINGS.petCarryPercent)
      : (settings?.humanCarryPercent ?? DEFAULT_SETTINGS.humanCarryPercent);

  const status: CarryStatus =
    percent >= cfg.max
      ? "overloaded"
      : percent >= cfg.warn
        ? "heavy"
        : percent >= cfg.ok
          ? "moderate"
          : "light";
  return { status, ...STATUS_CONFIG[status] };
}
