import { describe, expect, it } from "vitest";
import { computeTripStats } from "../trip-stats";
import type { Trip } from "@/types";

function tripWithPacks(packs: unknown[]): Trip {
  return { packs } as unknown as Trip;
}

const categoryShelter = { id: "cat-shelter", name: "Shelter", color: "#123" };
const categorySleep = { id: "cat-sleep", name: "Sleep", color: "#456" };

describe("computeTripStats — empty trip", () => {
  it("returns zeroed totals", () => {
    const stats = computeTripStats(tripWithPacks([]), null);
    expect(stats.packs).toEqual([]);
    expect(stats.householdCarriedGrams).toBe(0);
    expect(stats.sharedTotalGrams).toBe(0);
    expect(stats.sharedBalance).toEqual([]);
    expect(stats.memberCount).toBe(0);
  });

  it("handles a null trip without throwing", () => {
    expect(() => computeTripStats(null, null)).not.toThrow();
  });
});

describe("computeTripStats — pack weight splits", () => {
  const trip = tripWithPacks([
    {
      id: "pack-a",
      userId: "user-a",
      user: { id: "user-a", name: "Thomas", role: "adult", bodyWeightKg: 80 },
      packItems: [
        {
          id: "pi-1",
          itemId: "item-tent",
          quantity: 1,
          item: {
            id: "item-tent",
            name: "Tent",
            weightGrams: 1600,
            ownerType: "shared",
            ownerId: "h1",
            isWorn: false,
            isConsumable: false,
            category: categoryShelter,
            categoryId: categoryShelter.id,
          },
        },
        {
          id: "pi-2",
          itemId: "item-bag",
          quantity: 1,
          item: {
            id: "item-bag",
            name: "Sleeping Bag",
            weightGrams: 1000,
            ownerType: "personal",
            ownerId: "user-a",
            isWorn: false,
            isConsumable: false,
            category: categorySleep,
            categoryId: categorySleep.id,
          },
        },
        {
          id: "pi-3",
          itemId: "item-food",
          quantity: 2,
          item: {
            id: "item-food",
            name: "Food",
            weightGrams: 500,
            ownerType: "personal",
            ownerId: "user-a",
            isWorn: false,
            isConsumable: true,
            category: null,
            categoryId: null,
          },
        },
        {
          id: "pi-4",
          itemId: "item-jacket",
          quantity: 1,
          item: {
            id: "item-jacket",
            name: "Jacket",
            weightGrams: 300,
            ownerType: "personal",
            ownerId: "user-a",
            isWorn: true,
            isConsumable: false,
            category: null,
            categoryId: null,
          },
        },
      ],
    },
  ]);

  const stats = computeTripStats(trip, null);
  const pack = stats.packs[0];

  it("separates worn, base, and consumable", () => {
    expect(pack.wornGrams).toBe(300);
    expect(pack.baseGrams).toBe(2600); // 1600 tent + 1000 bag
    expect(pack.consumableGrams).toBe(1000); // 2 × 500
    expect(pack.carriedGrams).toBe(3600); // base + consumable
    expect(pack.skinOutGrams).toBe(3900); // carried + worn
  });

  it("splits personal vs shared (excludes worn)", () => {
    expect(pack.sharedGrams).toBe(1600); // tent only
    expect(pack.personalGrams).toBe(2000); // bag + 2 food
  });

  it("computes body weight percent from carried", () => {
    // 3600g / 80kg = 4.5%
    expect(pack.bodyWeightPct).toBeCloseTo(4.5, 5);
  });

  it("identifies the heaviest single pack-weight item", () => {
    expect(pack.heaviestItem).toEqual({ name: "Tent", grams: 1600 });
  });

  it("aggregates categories and sorts by weight desc", () => {
    expect(pack.categories[0]).toMatchObject({
      categoryId: categoryShelter.id,
      grams: 1600,
    });
    expect(pack.categories[1]).toMatchObject({
      categoryId: categorySleep.id,
      grams: 1000,
    });
    // Uncategorized food bucket
    const unc = pack.categories.find((c) => c.categoryId === null);
    expect(unc?.grams).toBe(1000);
  });
});

describe("computeTripStats — shared balance across packs", () => {
  const trip = tripWithPacks([
    {
      id: "pack-a",
      userId: "user-a",
      user: { id: "user-a", name: "Thomas", role: "adult", bodyWeightKg: 80 },
      packItems: [
        {
          id: "pi-a",
          itemId: "item-tent",
          quantity: 1,
          item: {
            id: "item-tent",
            name: "Tent",
            weightGrams: 1600,
            ownerType: "shared",
            ownerId: "h1",
            isWorn: false,
            isConsumable: false,
          },
        },
      ],
    },
    {
      id: "pack-b",
      userId: "user-b",
      user: { id: "user-b", name: "Partner", role: "adult", bodyWeightKg: 60 },
      packItems: [
        {
          id: "pi-b",
          itemId: "item-stove",
          quantity: 1,
          item: {
            id: "item-stove",
            name: "Stove",
            weightGrams: 400,
            ownerType: "shared",
            ownerId: "h1",
            isWorn: false,
            isConsumable: false,
          },
        },
      ],
    },
  ]);

  const stats = computeTripStats(trip, null);

  it("tallies household shared total", () => {
    expect(stats.sharedTotalGrams).toBe(2000);
  });

  it("sorts the balance by grams desc and includes percentage", () => {
    expect(stats.sharedBalance[0].userId).toBe("user-a");
    expect(stats.sharedBalance[0].pct).toBe(80);
    expect(stats.sharedBalance[1].userId).toBe("user-b");
    expect(stats.sharedBalance[1].pct).toBe(20);
  });
});

describe("computeTripStats — carrying-for tracking", () => {
  const trip = tripWithPacks([
    {
      id: "pack-a",
      userId: "user-a",
      user: { id: "user-a", name: "Thomas", role: "adult", bodyWeightKg: 80 },
      packItems: [
        {
          id: "pi-1",
          itemId: "item-kid-bag",
          ownedByUserId: "user-kid",
          quantity: 1,
          item: {
            id: "item-kid-bag",
            name: "Kid's Bag",
            weightGrams: 900,
            ownerType: "personal",
            ownerId: "user-kid",
            isWorn: false,
            isConsumable: false,
          },
        },
        {
          id: "pi-2",
          itemId: "item-own",
          ownedByUserId: "user-a",
          quantity: 1,
          item: {
            id: "item-own",
            name: "My Bag",
            weightGrams: 700,
            ownerType: "personal",
            ownerId: "user-a",
            isWorn: false,
            isConsumable: false,
          },
        },
      ],
    },
  ]);

  it("counts personal gear owned by someone else as carrying-for", () => {
    const stats = computeTripStats(trip, null);
    expect(stats.packs[0].carryingForGrams).toBe(900);
    expect(stats.packs[0].personalGrams).toBe(1600); // both personal
  });
});

describe("computeTripStats — pack class labels", () => {
  it("classifies an adult pack by base weight", () => {
    const trip = tripWithPacks([
      {
        id: "pack-a",
        userId: "user-a",
        user: { id: "user-a", name: "Thomas", role: "adult", bodyWeightKg: 80 },
        packItems: [
          {
            id: "pi-1",
            itemId: "item-base",
            quantity: 1,
            item: {
              id: "item-base",
              name: "Heavy Kit",
              weightGrams: 3000, // ~6.6 lb => ultralight
              ownerType: "personal",
              ownerId: "user-a",
              isWorn: false,
              isConsumable: false,
            },
          },
        ],
      },
    ]);
    const stats = computeTripStats(trip, null);
    expect(stats.packs[0].packClassLabel).toBe("Ultralight Pack");
  });

  it("classifies a pet pack by carry percent", () => {
    const trip = tripWithPacks([
      {
        id: "pack-pet",
        userId: "user-pet",
        user: { id: "user-pet", name: "Birch", role: "pet", bodyWeightKg: 25 },
        packItems: [
          {
            id: "pi-1",
            itemId: "item-food",
            quantity: 1,
            item: {
              id: "item-food",
              name: "Dog Food",
              weightGrams: 500, // 500g / 25kg = 2% → trail runner
              ownerType: "personal",
              ownerId: "user-pet",
              isWorn: false,
              isConsumable: true,
            },
          },
        ],
      },
    ]);
    const stats = computeTripStats(trip, null);
    expect(stats.packs[0].packClassLabel).toBe("Trail Runner");
  });
});
