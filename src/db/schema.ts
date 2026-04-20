import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ── Enums ──

export const weightUnitEnum = pgEnum("weight_unit", ["imperial", "metric"]);
export const ownerTypeEnum = pgEnum("owner_type", ["personal", "shared"]);
export const roleEnum = pgEnum("role", ["adult", "child", "pet"]);
export const sexEnum = pgEnum("sex", ["male", "female", "other"]);
export const seasonEnum = pgEnum("season", ["spring", "summer", "fall", "winter"]);
export const catalogSourceEnum = pgEnum("catalog_source", ["seed", "community"]);

// ── Household ──

/**
 * Per-household customizable weight thresholds. All numbers are **grams**
 * except `*CarryPercent` which are percent of body weight (0-100).
 */
export interface HouseholdSettings {
  packClassGrams?: {
    ultralight: number; // base weight < this = Ultralight
    lightweight: number; // < this = Lightweight
    traditional: number; // < this = Traditional, >= this = Heavy
  };
  humanCarryPercent?: {
    ok: number; // Comfortable below this %
    warn: number; // OK below this %
    max: number; // Above this % = Overloaded
  };
  petCarryPercent?: {
    ok: number;
    warn: number;
    max: number; // anything above = overloaded
  };
}

export const households = pgTable("household", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  settings: jsonb("settings").$type<HouseholdSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(users),
  categories: many(categories),
  trips: many(trips),
}));

// ── Auth.js + User ──

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  weightUnitPref: weightUnitEnum("weight_unit_pref").default("imperial"),
  bodyWeightKg: integer("body_weight_kg"),
  heightCm: integer("height_cm"),
  birthDate: date("birth_date"),
  sex: sexEnum("sex"),
  role: roleEnum("role").default("adult"),
  breed: text("breed"),
  managedByUserId: uuid("managed_by_user_id"),
  householdId: uuid("household_id").references(() => households.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  managedBy: one(users, {
    fields: [users.managedByUserId],
    references: [users.id],
  }),
  items: many(items),
  tripPacks: many(tripPacks),
}));

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ── Category ──

export const categories = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6b7280"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  parentCategoryId: uuid("parent_category_id"),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  household: one(households, {
    fields: [categories.householdId],
    references: [households.id],
  }),
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
  }),
  items: many(items),
}));

// ── Item ──

export const items = pgTable("item", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),
  weightGrams: integer("weight_grams").notNull().default(0),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  // Polymorphic: owner_id points to users.id when owner_type="personal",
  // households.id when owner_type="shared". Intentionally no FK — resolve at app layer.
  ownerId: uuid("owner_id").notNull(),
  isConsumable: boolean("is_consumable").default(false),
  isWorn: boolean("is_worn").default(false),
  // Stackable items (water bottles, fuel, food-per-day) stay in the trip Gear Pool
  // after being added to a pack, so they can be assigned to multiple packs.
  // Default false = one-and-only, disappears from pool once packed.
  allowMultiple: boolean("allow_multiple").default(false).notNull(),
  soloAltId: uuid("solo_alt_id"),
  tags: text("tags").array(),
  notes: text("notes"),
  imageUrl: text("image_url"),
  catalogProductId: uuid("catalog_product_id").references(() => catalogProducts.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemsRelations = relations(items, ({ one }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  soloAlt: one(items, {
    fields: [items.soloAltId],
    references: [items.id],
  }),
  catalogProduct: one(catalogProducts, {
    fields: [items.catalogProductId],
    references: [catalogProducts.id],
  }),
}));

// ── Kit ──

export const kits = pgTable("kit", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
});

export const kitItems = pgTable("kit_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  kitId: uuid("kit_id")
    .references(() => kits.id, { onDelete: "cascade" })
    .notNull(),
  itemId: uuid("item_id")
    .references(() => items.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

// ── Trip ──

export const trips = pgTable("trip", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  location: text("location"),
  season: seasonEnum("season"),
  terrain: text("terrain"),
  tempRangeLowF: integer("temp_range_low_f"),
  tempRangeHighF: integer("temp_range_high_f"),
  // Phase 8 metadata expansion — planned distance/elevation/duration. All
  // nullable so the form stays optional and the Phase 5 charts can show
  // trend lines as soon as users start filling them in.
  distanceMiles: integer("distance_miles"),
  elevationGainFt: integer("elevation_gain_ft"),
  elevationHighFt: integer("elevation_high_ft"),
  durationDays: integer("duration_days"),
  isActive: boolean("is_active").default(true),
  completedAt: timestamp("completed_at"),
  householdId: uuid("household_id")
    .references(() => households.id)
    .notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
  household: one(households, {
    fields: [trips.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [trips.createdByUserId],
    references: [users.id],
  }),
  members: many(tripMembers),
  packs: many(tripPacks),
}));

export const tripMembers = pgTable("trip_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  maxCarryWeightGrams: integer("max_carry_weight_grams"),
  targetBaseWeightGrams: integer("target_base_weight_grams"),
});

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripMembers.userId],
    references: [users.id],
  }),
}));

export const tripPacks = pgTable("trip_pack", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  actualTotalWeightGrams: integer("actual_total_weight_grams"),
  tripNotes: text("trip_notes"),
});

export const tripPacksRelations = relations(tripPacks, ({ one, many }) => ({
  trip: one(trips, {
    fields: [tripPacks.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripPacks.userId],
    references: [users.id],
  }),
  packItems: many(tripPackItems),
}));

export const tripPackItems = pgTable("trip_pack_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripPackId: uuid("trip_pack_id")
    .references(() => tripPacks.id, { onDelete: "cascade" })
    .notNull(),
  itemId: uuid("item_id")
    .references(() => items.id)
    .notNull(),
  ownedByUserId: uuid("owned_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isWornOverride: boolean("is_worn_override"),
  isConsumableOverride: boolean("is_consumable_override"),
  isBorrowed: boolean("is_borrowed").default(false),
  isChecked: boolean("is_checked").default(false),
});

export const tripPackItemsRelations = relations(tripPackItems, ({ one }) => ({
  tripPack: one(tripPacks, {
    fields: [tripPackItems.tripPackId],
    references: [tripPacks.id],
  }),
  item: one(items, {
    fields: [tripPackItems.itemId],
    references: [items.id],
  }),
  ownedBy: one(users, {
    fields: [tripPackItems.ownedByUserId],
    references: [users.id],
  }),
}));

// ── Catalog ──

export const catalogProducts = pgTable("catalog_product", {
  id: uuid("id").defaultRandom().primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  categorySuggestion: text("category_suggestion"),
  searchText: text("search_text").notNull(),
  source: catalogSourceEnum("source").default("seed"),
  sourceCount: integer("source_count").default(1),
  popularity: integer("popularity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Roadmap Suggestions ──

export const roadmapSuggestions = pgTable("roadmap_suggestion", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  phaseId: text("phase_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Type Exports ──

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Household = typeof households.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type TripMember = typeof tripMembers.$inferSelect;
export type TripPack = typeof tripPacks.$inferSelect;
export type TripPackItem = typeof tripPackItems.$inferSelect;
export type NewTripPackItem = typeof tripPackItems.$inferInsert;
export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type RoadmapSuggestion = typeof roadmapSuggestions.$inferSelect;
export type NewRoadmapSuggestion = typeof roadmapSuggestions.$inferInsert;
