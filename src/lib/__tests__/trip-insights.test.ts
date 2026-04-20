import { describe, expect, it } from "vitest";
import { computeTripInsights } from "../trip-insights";
import { computeTripStats } from "../trip-stats";
import type { Trip } from "@/types";

function tripWithPacks(packs: unknown[]): Trip {
  return { packs } as unknown as Trip;
}

describe("computeTripInsights — heaviest item", () => {
  it("flags a single item dominating base weight", () => {
    const trip = tripWithPacks([
      {
        id: "p1",
        userId: "u1",
        user: { id: "u1", name: "Thomas", role: "adult", bodyWeightKg: 80 },
        packItems: [
          {
            id: "pi-1",
            itemId: "tent",
            quantity: 1,
            item: {
              id: "tent",
              name: "Tent",
              weightGrams: 1600,
              ownerType: "personal",
              ownerId: "u1",
              isWorn: false,
              isConsumable: false,
            },
          },
          {
            id: "pi-2",
            itemId: "filler",
            quantity: 1,
            item: {
              id: "filler",
              name: "Other",
              weightGrams: 400,
              ownerType: "personal",
              ownerId: "u1",
              isWorn: false,
              isConsumable: false,
            },
          },
        ],
      },
    ]);
    const stats = computeTripStats(trip, null);
    const insights = computeTripInsights(stats, "lb");
    expect(insights.some((i) => i.id === "heaviest-p1")).toBe(true);
  });

  it("does not flag when no item dominates", () => {
    // 10 items × 100g = 1kg base; each item is only 10% → below 15% threshold
    const packItems = Array.from({ length: 10 }, (_, i) => ({
      id: `pi-${i}`,
      itemId: `it-${i}`,
      quantity: 1,
      item: {
        id: `it-${i}`,
        name: `Item ${i}`,
        weightGrams: 100,
        ownerType: "personal" as const,
        ownerId: "u1",
        isWorn: false,
        isConsumable: false,
      },
    }));
    const trip = tripWithPacks([
      {
        id: "p1",
        userId: "u1",
        user: { id: "u1", name: "Thomas", role: "adult", bodyWeightKg: 80 },
        packItems,
      },
    ]);
    const stats = computeTripStats(trip, null);
    const insights = computeTripInsights(stats, "lb");
    expect(insights.find((i) => i.id.startsWith("heaviest-"))).toBeUndefined();
  });
});

describe("computeTripInsights — shared gear imbalance", () => {
  it("flags when one person carries the overwhelming majority", () => {
    const trip = tripWithPacks([
      {
        id: "pa",
        userId: "ua",
        user: { id: "ua", name: "Thomas", role: "adult", bodyWeightKg: 80 },
        packItems: [
          {
            id: "pi-a",
            itemId: "tent",
            quantity: 1,
            item: {
              id: "tent",
              name: "Tent",
              weightGrams: 1600,
              ownerType: "shared",
              ownerId: "h1",
              isWorn: false,
              isConsumable: false,
            },
          },
          {
            id: "pi-b",
            itemId: "stove",
            quantity: 1,
            item: {
              id: "stove",
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
      {
        id: "pb",
        userId: "ub",
        user: { id: "ub", name: "Partner", role: "adult", bodyWeightKg: 60 },
        packItems: [
          {
            id: "pi-c",
            itemId: "filter",
            quantity: 1,
            item: {
              id: "filter",
              name: "Filter",
              weightGrams: 100,
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
    const insights = computeTripInsights(stats, "lb");
    const imbalance = insights.find((i) => i.id.startsWith("shared-imbalance-"));
    expect(imbalance).toBeDefined();
    expect(imbalance?.tone).toBe("warn");
  });
});

describe("computeTripInsights — empty pack", () => {
  it("flags a pack with no items", () => {
    const trip = tripWithPacks([
      {
        id: "p1",
        userId: "u1",
        user: { id: "u1", name: "Sam", role: "adult", bodyWeightKg: 60 },
        packItems: [],
      },
    ]);
    const stats = computeTripStats(trip, null);
    const insights = computeTripInsights(stats, "lb");
    expect(insights.find((i) => i.id === "empty-p1")).toBeDefined();
  });
});

describe("computeTripInsights — sort order", () => {
  it("sorts alert → warn → info → positive", () => {
    const trip = tripWithPacks([
      // Overloaded pack (alert)
      {
        id: "alert-pack",
        userId: "ua",
        user: { id: "ua", name: "Thomas", role: "adult", bodyWeightKg: 50 },
        packItems: [
          {
            id: "pi-1",
            itemId: "heavy",
            quantity: 1,
            item: {
              id: "heavy",
              name: "Heavy",
              weightGrams: 20000,
              ownerType: "personal",
              ownerId: "ua",
              isWorn: false,
              isConsumable: false,
            },
          },
        ],
      },
      // Ultralight pack (positive)
      {
        id: "ul-pack",
        userId: "ub",
        user: { id: "ub", name: "Partner", role: "adult", bodyWeightKg: 60 },
        packItems: [
          {
            id: "pi-2",
            itemId: "light",
            quantity: 1,
            item: {
              id: "light",
              name: "Light",
              weightGrams: 1000,
              ownerType: "personal",
              ownerId: "ub",
              isWorn: false,
              isConsumable: false,
            },
          },
        ],
      },
    ]);
    const stats = computeTripStats(trip, null);
    const insights = computeTripInsights(stats, "lb");
    expect(insights.length).toBeGreaterThan(0);
    const tones = insights.map((i) => i.tone);
    for (let i = 1; i < tones.length; i++) {
      expect(["alert", "warn", "info", "positive"].indexOf(tones[i])).toBeGreaterThanOrEqual(
        ["alert", "warn", "info", "positive"].indexOf(tones[i - 1])
      );
    }
  });
});
