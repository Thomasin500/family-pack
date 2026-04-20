// Shared TypeScript types matching the Drizzle schema.
// Used by hooks and components for type safety.

export interface HouseholdSettings {
  packClassGrams?: {
    ultralight: number;
    lightweight: number;
    traditional: number;
  };
  humanCarryPercent?: { ok: number; warn: number; max: number };
  petCarryPercent?: { ok: number; warn: number; max: number };
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  settings: HouseholdSettings | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
  weightUnitPref: "imperial" | "metric";
  bodyWeightKg: number | null;
  heightCm: number | null;
  birthDate: string | null;
  sex: "male" | "female" | "other" | null;
  role: "adult" | "child" | "pet";
  breed: string | null;
  managedByUserId: string | null;
  householdId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  sortOrder: number;
  parentCategoryId: string | null;
  householdId: string;
}

export interface Item {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  weightGrams: number;
  categoryId: string | null;
  ownerType: "personal" | "shared";
  ownerId: string;
  isConsumable: boolean;
  isWorn: boolean;
  allowMultiple: boolean;
  soloAltId: string | null;
  tags: string[] | null;
  notes: string | null;
  imageUrl: string | null;
  catalogProductId: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined relations (optional, present when queried with relations)
  category?: Category | null;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  season: "spring" | "summer" | "fall" | "winter" | null;
  terrain: string | null;
  tempRangeLowF: number | null;
  tempRangeHighF: number | null;
  distanceMiles: number | null;
  elevationGainFt: number | null;
  elevationHighFt: number | null;
  durationDays: number | null;
  isActive: boolean;
  completedAt: string | null;
  householdId: string;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined relations
  members?: TripMember[];
  packs?: TripPack[];
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  maxCarryWeightGrams: number | null;
  targetBaseWeightGrams: number | null;
  user?: User;
}

export interface TripPack {
  id: string;
  tripId: string;
  userId: string;
  actualTotalWeightGrams: number | null;
  tripNotes: string | null;
  user?: User;
  packItems?: TripPackItem[];
}

export interface TripPackItem {
  id: string;
  tripPackId: string;
  itemId: string;
  ownedByUserId: string | null;
  quantity: number;
  sortOrder: number;
  isWornOverride: boolean | null;
  isConsumableOverride: boolean | null;
  isBorrowed: boolean;
  isChecked: boolean;
  item?: Item;
}

export interface CatalogProduct {
  id: string;
  brand: string;
  model: string;
  categorySuggestion: string | null;
  searchText: string;
  source: "seed" | "community";
  sourceCount: number;
  popularity: number;
  createdAt: string;
}

// Hook return types
export interface HouseholdData {
  household: Household;
  members: User[];
  currentUserId: string;
}
