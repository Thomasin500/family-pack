import { db } from "../src/db";
import {
  households,
  users,
  categories,
  items,
  trips,
  tripMembers,
  tripPacks,
  tripPackItems,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Checking for existing dev data...");

  const existing = await db
    .select()
    .from(households)
    .where(eq(households.name, "Freeman Pack"))
    .limit(1);

  if (existing.length > 0) {
    console.log('Household "Freeman Pack" already exists — skipping seed.');
    process.exit(0);
  }

  // ── Household ──
  console.log("Creating household...");
  const [household] = await db
    .insert(households)
    .values({
      name: "Freeman Pack",
      inviteCode: "dev123",
    })
    .returning();

  // ── Users ──
  console.log("Creating users...");
  const [thomas] = await db
    .insert(users)
    .values({
      name: "Thomas",
      email: "thomas@test.com",
      role: "adult",
      bodyWeightKg: 82,
      householdId: household.id,
    })
    .returning();

  const [partner] = await db
    .insert(users)
    .values({
      name: "Partner",
      email: "partner@test.com",
      role: "adult",
      bodyWeightKg: 61,
      householdId: household.id,
    })
    .returning();

  const [birch] = await db
    .insert(users)
    .values({
      name: "Birch",
      role: "pet",
      bodyWeightKg: 25,
      breed: "Mixed",
      managedByUserId: thomas.id,
      householdId: household.id,
    })
    .returning();

  // ── Categories ──
  console.log("Creating categories...");
  const categoryDefs = [
    { name: "Big Four", color: "#ef4444", sortOrder: 0 },
    { name: "Shelter", color: "#f97316", sortOrder: 1 },
    { name: "Sleep", color: "#8b5cf6", sortOrder: 2 },
    { name: "Clothing", color: "#3b82f6", sortOrder: 3 },
    { name: "Kitchen & Food", color: "#22c55e", sortOrder: 4 },
    { name: "Water", color: "#06b6d4", sortOrder: 5 },
    { name: "Tools & Utility", color: "#a3a3a3", sortOrder: 6 },
    { name: "Fishing", color: "#14b8a6", sortOrder: 7 },
    { name: "Electronics", color: "#eab308", sortOrder: 8 },
    { name: "Pet Gear", color: "#ec4899", sortOrder: 9 },
  ] as const;

  const insertedCategories = await db
    .insert(categories)
    .values(
      categoryDefs.map((c) => ({
        name: c.name,
        color: c.color,
        sortOrder: c.sortOrder,
        householdId: household.id,
      }))
    )
    .returning();

  // Build a lookup by name
  const cat = Object.fromEntries(
    insertedCategories.map((c) => [c.name, c])
  );

  // ── Items ──
  console.log("Creating items...");

  // Shared items (ownerId = household.id)
  const sharedItemDefs = [
    {
      name: "Nemo Dagger 2P Tent",
      brand: "Nemo",
      model: "Dagger 2P",
      weightGrams: 1679,
      categoryId: cat["Shelter"].id,
    },
    {
      name: "Jetboil Flash Cook System",
      brand: "Jetboil",
      model: "Flash",
      weightGrams: 469,
      categoryId: cat["Kitchen & Food"].id,
    },
    {
      name: "Sawyer Squeeze Water Filter",
      brand: "Sawyer",
      model: "Squeeze",
      weightGrams: 162,
      categoryId: cat["Water"].id,
      isConsumable: false,
    },
    {
      name: "First Aid Kit",
      brand: null,
      model: null,
      weightGrams: 323,
      categoryId: cat["Tools & Utility"].id,
    },
    {
      name: "BV500 Bear Canister",
      brand: null,
      model: "BV500",
      weightGrams: 936,
      categoryId: cat["Kitchen & Food"].id,
    },
  ];

  const insertedSharedItems = await db
    .insert(items)
    .values(
      sharedItemDefs.map((item) => ({
        name: item.name,
        brand: item.brand,
        model: item.model,
        weightGrams: item.weightGrams,
        categoryId: item.categoryId,
        ownerType: "shared" as const,
        ownerId: household.id,
        isConsumable: item.isConsumable ?? false,
      }))
    )
    .returning();

  // Thomas's personal items
  const thomasItemDefs = [
    {
      name: "ULA Catalyst Pack",
      brand: "ULA",
      model: "Catalyst",
      weightGrams: 1196,
      categoryId: cat["Big Four"].id,
    },
    {
      name: "Kelty Cosmic 20 Sleeping Bag",
      brand: "Kelty",
      model: "Cosmic 20",
      weightGrams: 1232,
      categoryId: cat["Sleep"].id,
    },
    {
      name: "Therm-a-Rest NeoAir XTherm Pad",
      brand: "Therm-a-Rest",
      model: "NeoAir XTherm",
      weightGrams: 466,
      categoryId: cat["Sleep"].id,
    },
    {
      name: "Arc'teryx Atom Hoody",
      brand: "Arc'teryx",
      model: "Atom Hoody",
      weightGrams: 447,
      categoryId: cat["Clothing"].id,
      isWorn: true,
    },
  ];

  const insertedThomasItems = await db
    .insert(items)
    .values(
      thomasItemDefs.map((item) => ({
        name: item.name,
        brand: item.brand,
        model: item.model,
        weightGrams: item.weightGrams,
        categoryId: item.categoryId,
        ownerType: "personal" as const,
        ownerId: thomas.id,
        isWorn: item.isWorn ?? false,
      }))
    )
    .returning();

  // Partner's personal items
  const partnerItemDefs = [
    {
      name: "Granite Gear Crown2 60 Pack",
      brand: "Granite Gear",
      model: "Crown2 60",
      weightGrams: 1077,
      categoryId: cat["Big Four"].id,
    },
    {
      name: "Enlightened Equipment Enigma 20 Quilt",
      brand: "Enlightened Equipment",
      model: "Enigma 20",
      weightGrams: 680,
      categoryId: cat["Sleep"].id,
    },
    {
      name: "Therm-a-Rest NeoAir XLite Pad",
      brand: "Therm-a-Rest",
      model: "NeoAir XLite NXT",
      weightGrams: 354,
      categoryId: cat["Sleep"].id,
    },
  ];

  const insertedPartnerItems = await db
    .insert(items)
    .values(
      partnerItemDefs.map((item) => ({
        name: item.name,
        brand: item.brand,
        model: item.model,
        weightGrams: item.weightGrams,
        categoryId: item.categoryId,
        ownerType: "personal" as const,
        ownerId: partner.id,
      }))
    )
    .returning();

  // Birch's personal items (pet)
  const birchItemDefs = [
    {
      name: "Ruffwear Palisades Pack",
      brand: "Ruffwear",
      model: "Palisades Pack",
      weightGrams: 740,
      categoryId: cat["Pet Gear"].id,
    },
    {
      name: "Dog Food (2 meals)",
      brand: null,
      model: null,
      weightGrams: 529,
      categoryId: cat["Pet Gear"].id,
      isConsumable: true,
    },
    {
      name: "Pet First Aid Kit",
      brand: null,
      model: null,
      weightGrams: 327,
      categoryId: cat["Pet Gear"].id,
    },
    {
      name: "Red Sweater",
      brand: null,
      model: null,
      weightGrams: 251,
      categoryId: cat["Pet Gear"].id,
      isWorn: true,
    },
  ];

  const insertedBirchItems = await db
    .insert(items)
    .values(
      birchItemDefs.map((item) => ({
        name: item.name,
        brand: item.brand,
        model: item.model,
        weightGrams: item.weightGrams,
        categoryId: item.categoryId,
        ownerType: "personal" as const,
        ownerId: birch.id,
        isConsumable: item.isConsumable ?? false,
        isWorn: item.isWorn ?? false,
      }))
    )
    .returning();

  // ── Trip ──
  console.log("Creating trip...");
  const [trip] = await db
    .insert(trips)
    .values({
      name: "Olympic NP - Summer 2026",
      description: "3-night loop through the Hoh Rainforest and along the coast.",
      startDate: "2026-07-15",
      endDate: "2026-07-18",
      location: "Olympic National Park, WA",
      season: "summer",
      isActive: true,
      householdId: household.id,
      createdByUserId: thomas.id,
    })
    .returning();

  // ── Trip Members ──
  console.log("Adding trip members...");
  await db.insert(tripMembers).values([
    { tripId: trip.id, userId: thomas.id },
    { tripId: trip.id, userId: partner.id },
    { tripId: trip.id, userId: birch.id },
  ]);

  // ── Trip Packs ──
  console.log("Creating trip packs...");
  const [thomasPack] = await db
    .insert(tripPacks)
    .values({ tripId: trip.id, userId: thomas.id })
    .returning();

  const [partnerPack] = await db
    .insert(tripPacks)
    .values({ tripId: trip.id, userId: partner.id })
    .returning();

  const [birchPack] = await db
    .insert(tripPacks)
    .values({ tripId: trip.id, userId: birch.id })
    .returning();

  // ── Trip Pack Items ──
  console.log("Assigning items to packs...");

  // Thomas carries: his personal items + some shared items
  const thomasPackItemValues = [
    ...insertedThomasItems.map((item, i) => ({
      tripPackId: thomasPack.id,
      itemId: item.id,
      sortOrder: i,
    })),
    // Thomas carries the tent and bear canister (shared)
    {
      tripPackId: thomasPack.id,
      itemId: insertedSharedItems[0].id, // tent
      sortOrder: insertedThomasItems.length,
    },
    {
      tripPackId: thomasPack.id,
      itemId: insertedSharedItems[4].id, // bear canister
      sortOrder: insertedThomasItems.length + 1,
    },
  ];

  // Partner carries: their personal items + some shared items
  const partnerPackItemValues = [
    ...insertedPartnerItems.map((item, i) => ({
      tripPackId: partnerPack.id,
      itemId: item.id,
      sortOrder: i,
    })),
    // Partner carries the cook system, water filter, first aid (shared)
    {
      tripPackId: partnerPack.id,
      itemId: insertedSharedItems[1].id, // jetboil
      sortOrder: insertedPartnerItems.length,
    },
    {
      tripPackId: partnerPack.id,
      itemId: insertedSharedItems[2].id, // water filter
      sortOrder: insertedPartnerItems.length + 1,
    },
    {
      tripPackId: partnerPack.id,
      itemId: insertedSharedItems[3].id, // first aid
      sortOrder: insertedPartnerItems.length + 2,
    },
  ];

  // Birch carries: their own items
  const birchPackItemValues = insertedBirchItems.map((item, i) => ({
    tripPackId: birchPack.id,
    itemId: item.id,
    sortOrder: i,
  }));

  await db
    .insert(tripPackItems)
    .values([
      ...thomasPackItemValues,
      ...partnerPackItemValues,
      ...birchPackItemValues,
    ]);

  console.log("Done — dev data seeded successfully.");
  console.log(`  Household: ${household.name} (${household.id})`);
  console.log(`  Users: Thomas, Partner, Birch`);
  console.log(`  Categories: ${insertedCategories.length}`);
  console.log(
    `  Items: ${insertedSharedItems.length + insertedThomasItems.length + insertedPartnerItems.length + insertedBirchItems.length}`
  );
  console.log(`  Trip: ${trip.name}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
