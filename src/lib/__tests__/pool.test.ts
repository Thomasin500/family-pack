import { describe, expect, it } from "vitest";
import { computePackedQuantities, filterPoolItems } from "../pool";

describe("computePackedQuantities", () => {
  it("returns an empty map for no packs", () => {
    expect(computePackedQuantities([])).toEqual({});
  });

  it("sums quantities across packs for the same item", () => {
    const packs = [
      { packItems: [{ itemId: "a", quantity: 1 }] },
      { packItems: [{ itemId: "a", quantity: 2 }] },
      { packItems: [{ itemId: "b", quantity: 1 }] },
    ];
    expect(computePackedQuantities(packs)).toEqual({ a: 3, b: 1 });
  });

  it("prefers item.id over itemId when both exist", () => {
    const packs = [
      {
        packItems: [{ itemId: "wrong", quantity: 4, item: { id: "right" } }],
      },
    ];
    expect(computePackedQuantities(packs)).toEqual({ right: 4 });
  });

  it("defaults missing quantity to 1", () => {
    const packs = [{ packItems: [{ itemId: "a" }] }];
    expect(computePackedQuantities(packs)).toEqual({ a: 1 });
  });
});

describe("filterPoolItems", () => {
  const items = [
    { id: "a", allowMultiple: false }, // single
    { id: "b", allowMultiple: true }, // stackable
    { id: "c", allowMultiple: false }, // single
    { id: "d", allowMultiple: true }, // stackable
  ];

  it("includes all items when nothing is packed", () => {
    expect(filterPoolItems(items, {}).map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("hides single items once packed", () => {
    const packed = { a: 1, c: 2 };
    expect(filterPoolItems(items, packed).map((i) => i.id)).toEqual(["b", "d"]);
  });

  it("keeps stackable items in the pool even after being packed", () => {
    const packed = { b: 1, d: 5 };
    expect(filterPoolItems(items, packed).map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("mixes single and stackable behaviors correctly", () => {
    const packed = { a: 1, b: 2, c: 1 };
    expect(filterPoolItems(items, packed).map((i) => i.id)).toEqual(["b", "d"]);
  });

  it("treats null/undefined allowMultiple as single", () => {
    const weirdItems = [
      { id: "a" },
      { id: "b", allowMultiple: null },
      { id: "c", allowMultiple: undefined },
    ];
    expect(filterPoolItems(weirdItems, { a: 1, b: 1, c: 1 })).toEqual([]);
  });
});
