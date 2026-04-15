export interface PackZone {
  id: string;
  label: string;
  description: string;
  order: number;
}

export const PACK_ZONES: PackZone[] = [
  { id: "brain", label: "Brain / Lid", description: "Quick-access items", order: 0 },
  { id: "main-top", label: "Main: Top", description: "Clothing and layers", order: 1 },
  { id: "side-pockets", label: "Side Pockets", description: "Water and quick-grab", order: 2 },
  { id: "main-middle", label: "Main: Middle", description: "Kitchen and food", order: 3 },
  { id: "main-bottom", label: "Main: Bottom", description: "Sleep system", order: 4 },
  { id: "external", label: "External / Lashed", description: "Shelter and bulky items", order: 5 },
  { id: "worn", label: "Worn", description: "Items worn on body", order: 6 },
];

// Maps category names (lowercase) to pack zone IDs
const CATEGORY_ZONE_MAP: Record<string, string> = {
  "big four": "main-bottom",
  "shelter": "external",
  "sleep": "main-bottom",
  "sleep system": "main-bottom",
  "clothing": "main-top",
  "kitchen & food": "main-middle",
  "kitchen/food/water": "main-middle",
  "kitchen": "main-middle",
  "food": "main-middle",
  "water": "side-pockets",
  "tools & utility": "brain",
  "tools": "brain",
  "first aid": "brain",
  "electronics": "brain",
  "fishing": "external",
  "pet gear": "separate",
};

export function getZoneForCategory(categoryName: string): string {
  const key = categoryName.toLowerCase();
  return CATEGORY_ZONE_MAP[key] ?? "main-middle";
}

export function getZoneForItem(
  categoryName: string | undefined,
  isWorn: boolean
): string {
  if (isWorn) return "worn";
  if (!categoryName) return "main-middle";
  return getZoneForCategory(categoryName);
}
