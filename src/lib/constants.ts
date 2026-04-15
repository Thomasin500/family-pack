export const DEFAULT_CATEGORIES = [
  { name: "Big Four", color: "#ef4444", sortOrder: 0 },
  { name: "Shelter", color: "#f97316", sortOrder: 1 },
  { name: "Sleep", color: "#eab308", sortOrder: 2 },
  { name: "Clothing", color: "#22c55e", sortOrder: 3 },
  { name: "Kitchen & Food", color: "#3b82f6", sortOrder: 4 },
  { name: "Water", color: "#06b6d4", sortOrder: 5 },
  { name: "Tools & Utility", color: "#8b5cf6", sortOrder: 6 },
  { name: "Fishing", color: "#ec4899", sortOrder: 7 },
  { name: "Electronics", color: "#6366f1", sortOrder: 8 },
  { name: "Pet Gear", color: "#a855f7", sortOrder: 9 },
] as const;

export const PET_CARRY_LIMIT_PERCENT = 20; // max % of body weight for dogs
export const KID_CARRY_LIMIT_PERCENT = 15; // max % of body weight for kids
