/**
 * Seeds a realistic demo family with full gear closets, multiple trips,
 * and enough history to demonstrate veterancy, weight trends, and checklist mode.
 *
 * Run: npx tsx scripts/seed-demo-family.ts
 *
 * Family: Jake & Maya Chen, with their dog "Koda" (45 lb Australian Shepherd)
 * - 60+ gear items across personal, shared, and pet
 * - 4 trips spanning 3 seasons with different loadouts
 * - Shared gear distributed between carriers
 */
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
  console.log("Checking for existing demo data...");
  const existing = await db
    .select()
    .from(households)
    .where(eq(households.name, "Chen Family"))
    .limit(1);

  if (existing.length > 0) {
    console.log('"Chen Family" already exists — skipping.');
    process.exit(0);
  }

  // ── Household ──
  const [household] = await db
    .insert(households)
    .values({ name: "Chen Family", inviteCode: "demo456" })
    .returning();

  // ── Users ──
  const [jake] = await db
    .insert(users)
    .values({
      name: "Jake",
      email: "jake@demo.com",
      role: "adult",
      bodyWeightKg: 77, // ~170 lb
      householdId: household.id,
    })
    .returning();

  const [maya] = await db
    .insert(users)
    .values({
      name: "Maya",
      email: "maya@demo.com",
      role: "adult",
      bodyWeightKg: 59, // ~130 lb
      householdId: household.id,
    })
    .returning();

  const [koda] = await db
    .insert(users)
    .values({
      name: "Koda",
      role: "pet",
      bodyWeightKg: 20, // 45 lb Aussie
      breed: "Australian Shepherd",
      managedByUserId: jake.id,
      householdId: household.id,
    })
    .returning();

  // ── Categories ──
  const catDefs = [
    { name: "Big Four", color: "#ef4444", sortOrder: 0 },
    { name: "Shelter", color: "#f97316", sortOrder: 1 },
    { name: "Sleep", color: "#8b5cf6", sortOrder: 2 },
    { name: "Clothing", color: "#3b82f6", sortOrder: 3 },
    { name: "Kitchen & Food", color: "#22c55e", sortOrder: 4 },
    { name: "Water", color: "#06b6d4", sortOrder: 5 },
    { name: "Tools & Utility", color: "#a3a3a3", sortOrder: 6 },
    { name: "Electronics", color: "#eab308", sortOrder: 8 },
    { name: "Pet Gear", color: "#ec4899", sortOrder: 9 },
  ];

  const insertedCats = await db
    .insert(categories)
    .values(catDefs.map((c) => ({ ...c, householdId: household.id })))
    .returning();

  const cat = Object.fromEntries(insertedCats.map((c) => [c.name, c]));

  // ── Helper ──
  type ItemDef = {
    name: string;
    brand?: string | null;
    model?: string | null;
    weightGrams: number;
    categoryId: string;
    isWorn?: boolean;
    isConsumable?: boolean;
  };

  async function insertItems(defs: ItemDef[], ownerType: "personal" | "shared", ownerId: string) {
    return db
      .insert(items)
      .values(
        defs.map((d) => ({
          name: d.name,
          brand: d.brand ?? null,
          model: d.model ?? null,
          weightGrams: d.weightGrams,
          categoryId: d.categoryId,
          ownerType,
          ownerId,
          isWorn: d.isWorn ?? false,
          isConsumable: d.isConsumable ?? false,
        }))
      )
      .returning();
  }

  // ══════════════════════════════════════════════════════
  // SHARED GEAR
  // ══════════════════════════════════════════════════════
  const sharedItems = await insertItems(
    [
      {
        name: "Big Agnes Copper Spur HV UL2",
        brand: "Big Agnes",
        model: "Copper Spur HV UL2",
        weightGrams: 1247,
        categoryId: cat["Shelter"].id,
      },
      {
        name: "MSR Groundhog Stakes (6)",
        brand: "MSR",
        model: "Groundhog Stakes",
        weightGrams: 192,
        categoryId: cat["Shelter"].id,
      },
      {
        name: "MSR PocketRocket 2",
        brand: "MSR",
        model: "PocketRocket 2",
        weightGrams: 73,
        categoryId: cat["Kitchen & Food"].id,
      },
      {
        name: "Snow Peak Trek 900 Pot",
        brand: "Snow Peak",
        model: "Trek 900",
        weightGrams: 175,
        categoryId: cat["Kitchen & Food"].id,
      },
      {
        name: "Sawyer Squeeze",
        brand: "Sawyer",
        model: "Squeeze",
        weightGrams: 85,
        categoryId: cat["Water"].id,
      },
      {
        name: "CNOC Vecto 2L Dirty Bag",
        brand: "CNOC",
        model: "Vecto 2L",
        weightGrams: 54,
        categoryId: cat["Water"].id,
      },
      {
        name: "Ursack Major",
        brand: "Ursack",
        model: "Major",
        weightGrams: 219,
        categoryId: cat["Kitchen & Food"].id,
      },
      {
        name: "Adventure Medical Ultralight .7",
        brand: "SOL",
        model: "Ultralight .7",
        weightGrams: 212,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Sea to Summit Ultra-Sil Dry Sack 13L",
        brand: "Sea to Summit",
        model: "Ultra-Sil 13L",
        weightGrams: 36,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Litesmith Mini BIC",
        brand: null,
        model: null,
        weightGrams: 14,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "150ft Dyneema Guy Line",
        brand: null,
        model: null,
        weightGrams: 28,
        categoryId: cat["Tools & Utility"].id,
      },
    ],
    "shared",
    household.id
  );

  // ══════════════════════════════════════════════════════
  // JAKE'S GEAR
  // ══════════════════════════════════════════════════════
  const jakeItems = await insertItems(
    [
      {
        name: "Gossamer Gear Mariposa 60",
        brand: "Gossamer Gear",
        model: "Mariposa 60",
        weightGrams: 737,
        categoryId: cat["Big Four"].id,
      },
      {
        name: "Enlightened Equipment Enigma 20",
        brand: "Enlightened Equipment",
        model: "Enigma 20",
        weightGrams: 595,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Therm-a-Rest NeoAir XLite NXT",
        brand: "Therm-a-Rest",
        model: "NeoAir XLite NXT",
        weightGrams: 354,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Sea to Summit Aeros UL Pillow",
        brand: "Sea to Summit",
        model: "Aeros UL Pillow",
        weightGrams: 60,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Patagonia Torrentshell 3L",
        brand: "Patagonia",
        model: "Torrentshell 3L",
        weightGrams: 394,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "Patagonia Nano Puff",
        brand: "Patagonia",
        model: "Nano Puff",
        weightGrams: 337,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "Outdoor Research Ferrosi Pants",
        brand: "Outdoor Research",
        model: "Ferrosi Pants",
        weightGrams: 286,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Smartwool Merino 150 Tee",
        brand: "Smartwool",
        model: "Merino 150 Tee",
        weightGrams: 170,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Darn Tough Hiker Micro Crew",
        brand: "Darn Tough",
        model: "Hiker Micro Crew",
        weightGrams: 82,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Darn Tough Hiker Micro Crew (spare)",
        brand: "Darn Tough",
        model: "Hiker Micro Crew",
        weightGrams: 82,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "Black Diamond Spot 400",
        brand: "Black Diamond",
        model: "Spot 400",
        weightGrams: 95,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Black Diamond Distance Z Poles",
        brand: "Black Diamond",
        model: "Distance Z",
        weightGrams: 340,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Nitecore NB10000 Power Bank",
        brand: "Nitecore",
        model: "NB10000",
        weightGrams: 150,
        categoryId: cat["Electronics"].id,
      },
      {
        name: "Smartwater Bottle 1L",
        brand: null,
        model: null,
        weightGrams: 38,
        categoryId: cat["Water"].id,
      },
      {
        name: "Smartwater Bottle 1L (spare)",
        brand: null,
        model: null,
        weightGrams: 38,
        categoryId: cat["Water"].id,
      },
      {
        name: "Buff Coolnet UV+",
        brand: "Buff",
        model: "Coolnet UV+",
        weightGrams: 32,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Outdoor Research Sun Runner Cap",
        brand: "Outdoor Research",
        model: "Sun Runner",
        weightGrams: 54,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Deuce of Spades Trowel",
        brand: null,
        model: "Deuce of Spades",
        weightGrams: 18,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Sea to Summit Spork",
        brand: "Sea to Summit",
        model: "Delta Spork",
        weightGrams: 11,
        categoryId: cat["Kitchen & Food"].id,
      },
      {
        name: "Food (3 days)",
        brand: null,
        model: null,
        weightGrams: 1814,
        categoryId: cat["Kitchen & Food"].id,
        isConsumable: true,
      },
    ],
    "personal",
    jake.id
  );

  // ══════════════════════════════════════════════════════
  // MAYA'S GEAR
  // ══════════════════════════════════════════════════════
  const mayaItems = await insertItems(
    [
      {
        name: "ULA Circuit",
        brand: "ULA",
        model: "Circuit",
        weightGrams: 1106,
        categoryId: cat["Big Four"].id,
      },
      {
        name: "Katabatic Gear Palisade 15",
        brand: "Katabatic Gear",
        model: "Palisade 15",
        weightGrams: 652,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Nemo Tensor Insulated",
        brand: "Nemo",
        model: "Tensor Insulated",
        weightGrams: 425,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Therm-a-Rest Compressible Pillow S",
        brand: "Therm-a-Rest",
        model: "Compressible Pillow",
        weightGrams: 170,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Arc'teryx Beta LT",
        brand: "Arc'teryx",
        model: "Beta LT",
        weightGrams: 315,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "Arc'teryx Cerium Hoody",
        brand: "Arc'teryx",
        model: "Cerium Hoody",
        weightGrams: 275,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "prana Halle Jogger",
        brand: "prana",
        model: "Halle Jogger",
        weightGrams: 310,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Icebreaker 200 Oasis LS",
        brand: "Icebreaker",
        model: "200 Oasis LS",
        weightGrams: 195,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Darn Tough Light Hiker No Show",
        brand: "Darn Tough",
        model: "Light Hiker No Show",
        weightGrams: 56,
        categoryId: cat["Clothing"].id,
        isWorn: true,
      },
      {
        name: "Darn Tough Light Hiker No Show (spare)",
        brand: "Darn Tough",
        model: "Light Hiker No Show",
        weightGrams: 56,
        categoryId: cat["Clothing"].id,
      },
      {
        name: "Petzl Actik Core",
        brand: "Petzl",
        model: "Actik Core",
        weightGrams: 82,
        categoryId: cat["Tools & Utility"].id,
      },
      {
        name: "Anker 523 Power Bank",
        brand: "Anker",
        model: "523",
        weightGrams: 174,
        categoryId: cat["Electronics"].id,
      },
      {
        name: "Smartwater Bottle 1L",
        brand: null,
        model: null,
        weightGrams: 38,
        categoryId: cat["Water"].id,
      },
      {
        name: "Gossamer Gear Thinlite Sit Pad",
        brand: "Gossamer Gear",
        model: "Thinlite",
        weightGrams: 28,
        categoryId: cat["Sleep"].id,
      },
      {
        name: "Sea to Summit Spork",
        brand: "Sea to Summit",
        model: "Delta Spork",
        weightGrams: 11,
        categoryId: cat["Kitchen & Food"].id,
      },
      {
        name: "Food (3 days)",
        brand: null,
        model: null,
        weightGrams: 1361,
        categoryId: cat["Kitchen & Food"].id,
        isConsumable: true,
      },
    ],
    "personal",
    maya.id
  );

  // ══════════════════════════════════════════════════════
  // KODA'S GEAR (PET)
  // ══════════════════════════════════════════════════════
  const kodaItems = await insertItems(
    [
      {
        name: "Ruffwear Approach Pack",
        brand: "Ruffwear",
        model: "Approach Pack",
        weightGrams: 567,
        categoryId: cat["Pet Gear"].id,
      },
      {
        name: "Ruffwear Front Range Harness",
        brand: "Ruffwear",
        model: "Front Range Harness",
        weightGrams: 227,
        categoryId: cat["Pet Gear"].id,
        isWorn: true,
      },
      {
        name: "Ruffwear Highlands Sleeping Bag",
        brand: "Ruffwear",
        model: "Highlands Sleeping Bag",
        weightGrams: 794,
        categoryId: cat["Pet Gear"].id,
      },
      {
        name: "Ruffwear Trail Runner Bowl",
        brand: "Ruffwear",
        model: "Trail Runner Bowl",
        weightGrams: 52,
        categoryId: cat["Pet Gear"].id,
      },
      {
        name: "Dog Food (3 days)",
        brand: null,
        model: null,
        weightGrams: 907,
        categoryId: cat["Pet Gear"].id,
        isConsumable: true,
      },
      {
        name: "Poop Bags (roll)",
        brand: null,
        model: null,
        weightGrams: 28,
        categoryId: cat["Pet Gear"].id,
        isConsumable: true,
      },
      {
        name: "Musher's Secret Paw Wax",
        brand: null,
        model: "Musher's Secret",
        weightGrams: 57,
        categoryId: cat["Pet Gear"].id,
      },
      {
        name: "Ruffwear Climate Changer Fleece",
        brand: "Ruffwear",
        model: "Climate Changer",
        weightGrams: 198,
        categoryId: cat["Pet Gear"].id,
      },
    ],
    "personal",
    koda.id
  );

  // ══════════════════════════════════════════════════════
  // TRIPS
  // ══════════════════════════════════════════════════════

  async function createTrip(
    tripDef: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      location: string;
      season: "spring" | "summer" | "fall" | "winter";
    },
    memberIds: string[],
    packAssignments: { userId: string; itemIds: string[] }[]
  ) {
    const [trip] = await db
      .insert(trips)
      .values({
        ...tripDef,
        isActive: false,
        householdId: household.id,
        createdByUserId: jake.id,
      })
      .returning();

    await db.insert(tripMembers).values(memberIds.map((userId) => ({ tripId: trip.id, userId })));

    for (const pa of packAssignments) {
      const [pack] = await db
        .insert(tripPacks)
        .values({ tripId: trip.id, userId: pa.userId })
        .returning();

      if (pa.itemIds.length > 0) {
        await db.insert(tripPackItems).values(
          pa.itemIds.map((itemId, i) => ({
            tripPackId: pack.id,
            itemId,
            sortOrder: i,
          }))
        );
      }
    }

    return trip;
  }

  // Helper to get IDs by index
  const s = (i: number) => sharedItems[i].id;
  const j = (i: number) => jakeItems[i].id;
  const m = (i: number) => mayaItems[i].id;
  const k = (i: number) => kodaItems[i].id;

  // TRIP 1: Spring — Linville Gorge (all 3)
  await createTrip(
    {
      name: "Linville Gorge Overnight",
      description: "One night along the Linville River. Testing new gear.",
      startDate: "2025-04-12",
      endDate: "2025-04-13",
      location: "Linville Gorge, NC",
      season: "spring",
    },
    [jake.id, maya.id, koda.id],
    [
      {
        userId: jake.id,
        itemIds: [
          j(0),
          j(1),
          j(2),
          j(3),
          j(4),
          j(5),
          j(10),
          j(11),
          j(13),
          j(17),
          j(18),
          s(0),
          s(1),
          s(6),
        ],
      },
      {
        userId: maya.id,
        itemIds: [m(0), m(1), m(2), m(4), m(5), m(10), m(12), m(14), s(2), s(3), s(4), s(5), s(7)],
      },
      { userId: koda.id, itemIds: [k(0), k(1), k(3), k(4), k(5)] },
    ]
  );

  // TRIP 2: Summer — Roan Highlands (all 3)
  await createTrip(
    {
      name: "Roan Highlands AT Section",
      description: "3 nights on the AT through the balds. Hot days, cool nights.",
      startDate: "2025-07-04",
      endDate: "2025-07-07",
      location: "Roan Mountain, TN/NC",
      season: "summer",
    },
    [jake.id, maya.id, koda.id],
    [
      {
        userId: jake.id,
        itemIds: [
          j(0),
          j(1),
          j(2),
          j(3),
          j(4),
          j(10),
          j(11),
          j(12),
          j(13),
          j(14),
          j(15),
          j(16),
          j(17),
          j(18),
          j(19),
          s(0),
          s(1),
          s(6),
          s(9),
        ],
      },
      {
        userId: maya.id,
        itemIds: [
          m(0),
          m(1),
          m(2),
          m(4),
          m(10),
          m(11),
          m(12),
          m(13),
          m(14),
          m(15),
          s(2),
          s(3),
          s(4),
          s(5),
          s(7),
          s(8),
        ],
      },
      { userId: koda.id, itemIds: [k(0), k(1), k(3), k(4), k(5), k(6)] },
    ]
  );

  // TRIP 3: Fall — Shining Rock (Jake + Maya, no dog)
  await createTrip(
    {
      name: "Shining Rock Loop",
      description: "2-night loop. Left Koda with the neighbors.",
      startDate: "2025-10-18",
      endDate: "2025-10-20",
      location: "Shining Rock Wilderness, NC",
      season: "fall",
    },
    [jake.id, maya.id],
    [
      {
        userId: jake.id,
        itemIds: [
          j(0),
          j(1),
          j(2),
          j(3),
          j(4),
          j(5),
          j(9),
          j(10),
          j(11),
          j(12),
          j(13),
          j(17),
          j(18),
          j(19),
          s(0),
          s(1),
          s(6),
          s(9),
          s(10),
        ],
      },
      {
        userId: maya.id,
        itemIds: [
          m(0),
          m(1),
          m(2),
          m(3),
          m(4),
          m(5),
          m(9),
          m(10),
          m(11),
          m(12),
          m(13),
          m(14),
          m(15),
          s(2),
          s(3),
          s(4),
          s(5),
          s(7),
          s(8),
        ],
      },
    ]
  );

  // TRIP 4: Upcoming Summer — Pisgah (active, all 3)
  const [activeTrip] = await db
    .insert(trips)
    .values({
      name: "Pisgah National Forest",
      description: "3 nights. Art Loeb Trail to Black Balsam.",
      startDate: "2026-06-20",
      endDate: "2026-06-23",
      location: "Pisgah NF, NC",
      season: "summer",
      isActive: true,
      householdId: household.id,
      createdByUserId: jake.id,
    })
    .returning();

  await db.insert(tripMembers).values([
    { tripId: activeTrip.id, userId: jake.id },
    { tripId: activeTrip.id, userId: maya.id },
    { tripId: activeTrip.id, userId: koda.id },
  ]);

  const [jakePack4] = await db
    .insert(tripPacks)
    .values({ tripId: activeTrip.id, userId: jake.id })
    .returning();
  const [mayaPack4] = await db
    .insert(tripPacks)
    .values({ tripId: activeTrip.id, userId: maya.id })
    .returning();
  const [kodaPack4] = await db
    .insert(tripPacks)
    .values({ tripId: activeTrip.id, userId: koda.id })
    .returning();

  // Full loadout for the upcoming trip
  await db.insert(tripPackItems).values([
    // Jake's pack
    ...[
      j(0),
      j(1),
      j(2),
      j(3),
      j(4),
      j(5),
      j(9),
      j(10),
      j(11),
      j(12),
      j(13),
      j(14),
      j(15),
      j(16),
      j(17),
      j(18),
      j(19),
    ].map((itemId, i) => ({ tripPackId: jakePack4.id, itemId, sortOrder: i })),
    // Jake carries shared tent + stakes + bear bag
    { tripPackId: jakePack4.id, itemId: s(0), sortOrder: 20 },
    { tripPackId: jakePack4.id, itemId: s(1), sortOrder: 21 },
    { tripPackId: jakePack4.id, itemId: s(6), sortOrder: 22 },
    { tripPackId: jakePack4.id, itemId: s(9), sortOrder: 23 },
    { tripPackId: jakePack4.id, itemId: s(10), sortOrder: 24 },

    // Maya's pack
    ...[m(0), m(1), m(2), m(3), m(4), m(5), m(9), m(10), m(11), m(12), m(13), m(14), m(15)].map(
      (itemId, i) => ({ tripPackId: mayaPack4.id, itemId, sortOrder: i })
    ),
    // Maya carries shared stove + pot + filter + dirty bag + first aid + dry sack
    { tripPackId: mayaPack4.id, itemId: s(2), sortOrder: 15 },
    { tripPackId: mayaPack4.id, itemId: s(3), sortOrder: 16 },
    { tripPackId: mayaPack4.id, itemId: s(4), sortOrder: 17 },
    { tripPackId: mayaPack4.id, itemId: s(5), sortOrder: 18 },
    { tripPackId: mayaPack4.id, itemId: s(7), sortOrder: 19 },
    { tripPackId: mayaPack4.id, itemId: s(8), sortOrder: 20 },

    // Koda's pack
    ...[k(0), k(1), k(2), k(3), k(4), k(5), k(6), k(7)].map((itemId, i) => ({
      tripPackId: kodaPack4.id,
      itemId,
      sortOrder: i,
    })),
  ]);

  console.log("\nDemo family seeded successfully!");
  console.log(`  Household: ${household.name}`);
  console.log(`  Members: Jake, Maya, Koda (Australian Shepherd)`);
  console.log(
    `  Items: ${sharedItems.length} shared + ${jakeItems.length} Jake + ${mayaItems.length} Maya + ${kodaItems.length} Koda = ${sharedItems.length + jakeItems.length + mayaItems.length + kodaItems.length}`
  );
  console.log(`  Trips: 4 (3 past + 1 upcoming active)`);
  console.log(`  Invite code: demo456`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
