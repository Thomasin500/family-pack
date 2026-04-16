"use client";

import { createContext, useContext, useState } from "react";
import type { DisplayUnit } from "@/lib/weight";

const UNIT_CYCLE: DisplayUnit[] = ["oz", "lb", "g", "kg"];
const STORAGE_KEY = "family-pack-display-unit";

function getStoredUnit(): DisplayUnit {
  if (typeof window === "undefined") return "oz";
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as DisplayUnit | null;
    if (stored && UNIT_CYCLE.includes(stored)) return stored;
  } catch {
    // SSR or localStorage unavailable
  }
  return "oz";
}

interface WeightUnitContextValue {
  unit: DisplayUnit;
  system: "imperial" | "metric";
  toggle: () => void;
}

const WeightUnitContext = createContext<WeightUnitContextValue>({
  unit: "oz",
  system: "imperial",
  toggle: () => {},
});

export function WeightUnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<DisplayUnit>(getStoredUnit);

  function toggle() {
    const idx = UNIT_CYCLE.indexOf(unit);
    const next = UNIT_CYCLE[(idx + 1) % UNIT_CYCLE.length];
    setUnit(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const system: "imperial" | "metric" = unit === "g" || unit === "kg" ? "metric" : "imperial";

  return (
    <WeightUnitContext.Provider value={{ unit, system, toggle }}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  return useContext(WeightUnitContext);
}
