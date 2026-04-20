export type VeterancyLevel = "New" | "Trusted" | "Veteran" | "Legendary";

export function getVeterancyLevel(tripCount: number): VeterancyLevel {
  if (tripCount === 0) return "New";
  if (tripCount <= 5) return "Trusted";
  if (tripCount <= 10) return "Veteran";
  return "Legendary";
}

export function getVeterancyColor(level: VeterancyLevel): string {
  switch (level) {
    case "New":
      return "text-muted-foreground";
    case "Trusted":
      return "text-green-600 dark:text-green-400";
    case "Veteran":
      return "text-amber-600 dark:text-amber-400";
    case "Legendary":
      return "text-purple-600 dark:text-purple-400";
  }
}
