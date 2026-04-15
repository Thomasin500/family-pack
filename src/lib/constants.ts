export const DEFAULT_CATEGORIES = [
  { name: "Big Four", color: "#6B9E6B", sortOrder: 0 },
  { name: "Shelter", color: "#6B9E6B", sortOrder: 1 },
  { name: "Sleep", color: "#3a86ff", sortOrder: 2 },
  { name: "Clothing", color: "#9b59b6", sortOrder: 3 },
  { name: "Kitchen & Food", color: "#ea6b1e", sortOrder: 4 },
  { name: "Water", color: "#3a86ff", sortOrder: 5 },
  { name: "Tools & Utility", color: "#8b9388", sortOrder: 6 },
  { name: "Fishing", color: "#14b8a6", sortOrder: 7 },
  { name: "Electronics", color: "#eab308", sortOrder: 8 },
  { name: "Pet Gear", color: "#8B6914", sortOrder: 9 },
  { name: "Health & Hygiene", color: "#c77c94", sortOrder: 10 },
] as const;

export const PET_CARRY_LIMIT_PERCENT = 20; // max % of body weight for dogs
export const KID_CARRY_LIMIT_PERCENT = 15; // max % of body weight for kids
