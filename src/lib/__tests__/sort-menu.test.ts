import { describe, expect, it } from "vitest";
import { sortItems } from "@/components/ui/sort-menu";

describe("sortItems", () => {
  const items = [
    { name: "Alpha", weightGrams: 100, isWorn: false, isConsumable: false, sortOrder: 2 },
    { name: "Charlie", weightGrams: 50, isWorn: true, isConsumable: false, sortOrder: 0 },
    { name: "Bravo", weightGrams: 200, isWorn: false, isConsumable: true, sortOrder: 1 },
  ];

  it("sorts by name A-Z", () => {
    expect(sortItems(items, "name").map((i) => i.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("sorts by name Z-A", () => {
    expect(sortItems(items, "name-desc").map((i) => i.name)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("sorts by weight ascending", () => {
    expect(sortItems(items, "weight-asc").map((i) => i.name)).toEqual([
      "Charlie",
      "Alpha",
      "Bravo",
    ]);
  });

  it("sorts by weight descending", () => {
    expect(sortItems(items, "weight-desc").map((i) => i.name)).toEqual([
      "Bravo",
      "Alpha",
      "Charlie",
    ]);
  });

  it("sorts by type: worn → carried → consumable", () => {
    expect(sortItems(items, "type").map((i) => i.name)).toEqual([
      "Charlie", // worn
      "Alpha", // carried
      "Bravo", // consumable
    ]);
  });

  it("manual mode sorts by sortOrder ascending", () => {
    expect(sortItems(items, "manual").map((i) => i.name)).toEqual([
      "Charlie", // sortOrder 0
      "Bravo", // sortOrder 1
      "Alpha", // sortOrder 2
    ]);
  });

  it("manual mode falls back to name when sortOrders tie", () => {
    const tied = [
      { name: "Zebra", weightGrams: 0, sortOrder: 0 },
      { name: "Apple", weightGrams: 0, sortOrder: 0 },
      { name: "Mango", weightGrams: 0, sortOrder: 0 },
    ];
    expect(sortItems(tied, "manual").map((i) => i.name)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("manual mode defaults sortOrder to 0 when absent", () => {
    const noOrder = [{ name: "B" }, { name: "A" }];
    expect(sortItems(noOrder as never, "manual").map((i) => i.name)).toEqual(["A", "B"]);
  });
});
