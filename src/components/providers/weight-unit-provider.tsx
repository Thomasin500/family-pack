"use client";

import { createContext, useContext } from "react";
import { useUserPreferences, useUpdateWeightUnit } from "@/hooks/use-user-preferences";

type WeightUnit = "imperial" | "metric";

interface WeightUnitContextValue {
  unit: WeightUnit;
  toggle: () => void;
  isLoading: boolean;
}

const WeightUnitContext = createContext<WeightUnitContextValue>({
  unit: "imperial",
  toggle: () => {},
  isLoading: true,
});

export function WeightUnitProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useUserPreferences();
  const updateUnit = useUpdateWeightUnit();

  const unit: WeightUnit = data?.weightUnitPref ?? "imperial";

  function toggle() {
    updateUnit.mutate(unit === "imperial" ? "metric" : "imperial");
  }

  return (
    <WeightUnitContext.Provider value={{ unit, toggle, isLoading }}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  return useContext(WeightUnitContext);
}
