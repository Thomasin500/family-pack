export type CarryStatus = "light" | "moderate" | "heavy" | "overloaded";

export interface CarryWarning {
  status: CarryStatus;
  label: string;
  color: string;
}

const HUMAN_THRESHOLDS: [number, CarryStatus][] = [
  [25, "overloaded"],
  [20, "heavy"],
  [15, "moderate"],
  [0, "light"],
];

const PET_THRESHOLDS: [number, CarryStatus][] = [
  [20, "overloaded"],
  [15, "heavy"],
  [10, "moderate"],
  [0, "light"],
];

const STATUS_CONFIG: Record<CarryStatus, { label: string; color: string }> = {
  light: { label: "Light", color: "text-green-600 dark:text-green-400" },
  moderate: { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400" },
  heavy: { label: "Heavy", color: "text-orange-600 dark:text-orange-400" },
  overloaded: { label: "Overloaded", color: "text-red-600 dark:text-red-400" },
};

export function getCarryWarning(percent: number, role: "adult" | "child" | "pet"): CarryWarning {
  const thresholds = role === "pet" ? PET_THRESHOLDS : HUMAN_THRESHOLDS;
  for (const [threshold, status] of thresholds) {
    if (percent >= threshold) {
      return { status, ...STATUS_CONFIG[status] };
    }
  }
  return { status: "light", ...STATUS_CONFIG.light };
}
