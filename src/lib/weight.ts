export type DisplayUnit = "oz" | "lb" | "g" | "kg";

export function gramsToOz(grams: number): number {
  return grams / 28.3495;
}

export function ozToGrams(oz: number): number {
  return Math.round(oz * 28.3495);
}

export function gramsToLb(grams: number): number {
  return grams / 453.592;
}

export function lbToGrams(lb: number): number {
  return Math.round(lb * 453.592);
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

export function displayWeight(grams: number, unit: DisplayUnit | "imperial" | "metric"): string {
  // Support legacy "imperial"/"metric" values
  const resolved = unit === "imperial" ? "oz" : unit === "metric" ? "g" : unit;

  switch (resolved) {
    case "g":
      return `${grams} g`;
    case "kg":
      return `${(grams / 1000).toFixed(2)} kg`;
    case "oz":
      return `${gramsToOz(grams).toFixed(1)} oz`;
    case "lb": {
      const oz = gramsToOz(grams);
      const lb = Math.floor(oz / 16);
      const remainOz = oz % 16;
      if (lb === 0) return `${remainOz.toFixed(1)} oz`;
      return remainOz > 0.05 ? `${lb} lb ${remainOz.toFixed(1)} oz` : `${lb} lb`;
    }
    default:
      return `${grams} g`;
  }
}

/** Suffix label for inline edit inputs */
export function unitSuffix(unit: DisplayUnit | "imperial" | "metric"): string {
  const resolved = unit === "imperial" ? "oz" : unit === "metric" ? "g" : unit;
  switch (resolved) {
    case "g":
      return "g";
    case "kg":
      return "kg";
    case "oz":
      return "oz";
    case "lb":
      return "oz";
    default:
      return "g";
  }
}

/** Convert a user-entered value back to grams */
export function inputToGrams(value: number, unit: DisplayUnit | "imperial" | "metric"): number {
  const resolved = unit === "imperial" ? "oz" : unit === "metric" ? "g" : unit;
  switch (resolved) {
    case "g":
      return Math.round(value);
    case "kg":
      return kgToGrams(value);
    case "oz":
      return ozToGrams(value);
    case "lb":
      return ozToGrams(value); // input is in oz for lb mode too
    default:
      return Math.round(value);
  }
}

/** Convert grams to the unit's editable value */
export function gramsToInput(grams: number, unit: DisplayUnit | "imperial" | "metric"): string {
  const resolved = unit === "imperial" ? "oz" : unit === "metric" ? "g" : unit;
  switch (resolved) {
    case "g":
      return grams.toString();
    case "kg":
      return (grams / 1000).toFixed(2);
    case "oz":
      return gramsToOz(grams).toFixed(2);
    case "lb":
      return gramsToOz(grams).toFixed(2); // edit in oz
    default:
      return grams.toString();
  }
}

/** Step size for number inputs */
export function inputStep(unit: DisplayUnit | "imperial" | "metric"): string {
  const resolved = unit === "imperial" ? "oz" : unit === "metric" ? "g" : unit;
  switch (resolved) {
    case "g":
      return "1";
    case "kg":
      return "0.01";
    case "oz":
      return "0.1";
    case "lb":
      return "0.1";
    default:
      return "1";
  }
}

export function bodyWeightPercent(carryGrams: number, bodyKg: number): number {
  if (!bodyKg || bodyKg === 0) return 0;
  return (carryGrams / (bodyKg * 1000)) * 100;
}
