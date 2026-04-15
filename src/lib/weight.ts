export function gramsToOz(grams: number): number {
  return grams / 28.3495;
}

export function ozToGrams(oz: number): number {
  return Math.round(oz * 28.3495);
}

export function gramsToLb(grams: number): number {
  return grams / 453.592;
}

export function displayWeight(grams: number, unit: "imperial" | "metric"): string {
  if (unit === "metric") {
    return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
  }
  const oz = gramsToOz(grams);
  if (oz >= 32) {
    const lb = Math.floor(oz / 16);
    const remainOz = oz % 16;
    return remainOz > 0.05 ? `${lb} lb ${remainOz.toFixed(1)} oz` : `${lb} lb`;
  }
  return `${oz.toFixed(1)} oz`;
}

export function bodyWeightPercent(carryGrams: number, bodyKg: number): number {
  if (!bodyKg || bodyKg === 0) return 0;
  return (carryGrams / (bodyKg * 1000)) * 100;
}
