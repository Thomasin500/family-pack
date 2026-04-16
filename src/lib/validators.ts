import { z } from "zod";

// ── Household ──

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

// ── Members ──

export const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(["child", "pet"]),
  bodyWeightKg: z.number().positive().optional(),
  breed: z.string().max(100).optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bodyWeightKg: z.number().positive().nullable().optional(),
  breed: z.string().max(100).nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  sex: z.enum(["male", "female", "other"]).nullable().optional(),
});

// ── Categories ──

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6b7280"),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  icon: z.string().max(50).nullable().optional(),
});

// ── Items ──

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  brand: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  weightGrams: z.number().int().min(0).default(0),
  categoryId: z.string().uuid().nullable().optional(),
  ownerType: z.enum(["personal", "shared"]),
  ownerId: z.string().uuid(),
  isConsumable: z.boolean().default(false),
  isWorn: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  catalogProductId: z.string().uuid().nullable().optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(200).nullable().optional(),
  model: z.string().max(200).nullable().optional(),
  weightGrams: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  ownerType: z.enum(["personal", "shared"]).optional(),
  ownerId: z.string().uuid().optional(),
  isConsumable: z.boolean().optional(),
  isWorn: z.boolean().optional(),
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

// ── Trips ──

export const createTripSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().max(200).optional(),
  season: z.enum(["spring", "summer", "fall", "winter"]).optional(),
  terrain: z.string().max(200).optional(),
  memberIds: z.array(z.string().uuid()).min(1, "At least one member required"),
});

export const updateTripSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  season: z.enum(["spring", "summer", "fall", "winter"]).nullable().optional(),
  terrain: z.string().max(200).nullable().optional(),
  tempRangeLowF: z.number().int().nullable().optional(),
  tempRangeHighF: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
  completedAt: z.preprocess(
    (v) => (typeof v === "string" ? new Date(v) : v),
    z.date().nullable().optional()
  ),
});

// ── Trip Members ──

export const addTripMemberSchema = z.object({
  userId: z.string().uuid("userId is required"),
});

// ── Trip Pack Items ──

export const addPackItemSchema = z.object({
  itemId: z.string().uuid("itemId is required"),
  quantity: z.number().int().min(1).default(1),
  ownedByUserId: z.string().uuid().nullable().optional(),
  isWornOverride: z.boolean().nullable().optional(),
  isConsumableOverride: z.boolean().nullable().optional(),
});

export const updatePackItemSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  ownedByUserId: z.string().uuid().nullable().optional(),
  isWornOverride: z.boolean().nullable().optional(),
  isConsumableOverride: z.boolean().nullable().optional(),
  isBorrowed: z.boolean().optional(),
  isChecked: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── User Profile ──

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bodyWeightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
});

// ── Catalog ──

export const catalogSelectSchema = z.object({
  id: z.string().uuid("Catalog product ID is required"),
});

// ── Roadmap Suggestions ──

export const createRoadmapSuggestionSchema = z.object({
  phaseId: z.string().min(1).max(100).nullable().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(4000),
});

export const updateRoadmapSuggestionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(4000).optional(),
  phaseId: z.string().min(1).max(100).nullable().optional(),
  status: z.enum(["open", "reviewing", "accepted", "declined"]).optional(),
});
