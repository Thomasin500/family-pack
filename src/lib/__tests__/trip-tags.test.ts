import { describe, expect, it } from "vitest";
import { computeTripTags } from "../trip-tags";
import { computeTripStats } from "../trip-stats";
import type { Trip } from "@/types";

function tripWith(packs: unknown[], extras: Partial<Trip> = {}): Trip {
  return { packs, ...extras } as unknown as Trip;
}

function basicItem(name: string, extra: Record<string, unknown> = {}) {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    brand: null,
    model: null,
    weightGrams: 500,
    ownerType: "personal",
    ownerId: "u1",
    isWorn: false,
    isConsumable: false,
    category: null,
    ...extra,
  };
}

function packWithItems(id: string, role: "adult" | "pet", items: unknown[]) {
  return {
    id,
    userId: `user-${id}`,
    user: { id: `user-${id}`, name: id, role, bodyWeightKg: role === "pet" ? 25 : 80 },
    packItems: items.map((item, i) => ({
      id: `pi-${id}-${i}`,
      itemId: (item as { id: string }).id,
      quantity: 1,
      item,
    })),
  };
}

describe("computeTripTags", () => {
  it("emits Dog Friendly when a pet pack is present", () => {
    const trip = tripWith([packWithItems("dog", "pet", [basicItem("Pack")])]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "dog-friendly")).toBeDefined();
  });

  it("emits Bear Safe when a bear canister is in a pack", () => {
    const trip = tripWith([packWithItems("a", "adult", [basicItem("Bearvault BV500")])]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "bear-safe")).toBeDefined();
  });

  it("emits Fishing when fishing gear is present", () => {
    const trip = tripWith([packWithItems("a", "adult", [basicItem("Tenkara Rod")])]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "fishing")).toBeDefined();
  });

  it("emits Ultralight when the lightest adult base < 10 lb", () => {
    const trip = tripWith([
      packWithItems("a", "adult", [basicItem("Light", { weightGrams: 2000 })]),
    ]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "ultralight")).toBeDefined();
  });

  it("emits Multi-Day when start/end span 3+ days", () => {
    const trip = tripWith(
      [packWithItems("a", "adult", [basicItem("Tent", { weightGrams: 1600 })])],
      { startDate: "2026-07-01", endDate: "2026-07-03" } // inclusive = 3 days
    );
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    const day = tags.find((t) => t.id === "multi-day");
    expect(day).toBeDefined();
    expect(day?.label).toBe("3-Day");
  });

  it("does not emit Multi-Day for single-day trips", () => {
    const trip = tripWith(
      [packWithItems("a", "adult", [basicItem("Tent", { weightGrams: 1600 })])],
      { startDate: "2026-07-01", endDate: "2026-07-01" }
    );
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "multi-day")).toBeUndefined();
  });

  it("emits Minimalist when ≤ 10 total items", () => {
    const trip = tripWith([packWithItems("a", "adult", [basicItem("One"), basicItem("Two")])]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "minimalist")).toBeDefined();
  });

  it("does not emit Minimalist for big packs", () => {
    const items = Array.from({ length: 15 }, (_, i) => basicItem(`item-${i}`));
    const trip = tripWith([packWithItems("a", "adult", items)]);
    const stats = computeTripStats(trip, null);
    const tags = computeTripTags(trip, stats);
    expect(tags.find((t) => t.id === "minimalist")).toBeUndefined();
  });
});
