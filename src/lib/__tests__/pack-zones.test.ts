import { describe, it, expect } from "vitest";
import { getZoneForCategory, getZoneForItem, PACK_ZONES } from "../pack-zones";

describe("PACK_ZONES", () => {
  it("has zones in order", () => {
    for (let i = 1; i < PACK_ZONES.length; i++) {
      expect(PACK_ZONES[i].order).toBeGreaterThan(PACK_ZONES[i - 1].order);
    }
  });

  it("includes the core zones", () => {
    const ids = PACK_ZONES.map((z) => z.id);
    expect(ids).toContain("brain");
    expect(ids).toContain("main-top");
    expect(ids).toContain("main-middle");
    expect(ids).toContain("main-bottom");
    expect(ids).toContain("external");
    expect(ids).toContain("worn");
  });
});

describe("getZoneForCategory", () => {
  it("maps Big Four to main-bottom", () => {
    expect(getZoneForCategory("Big Four")).toBe("main-bottom");
  });

  it("maps Shelter to external", () => {
    expect(getZoneForCategory("Shelter")).toBe("external");
  });

  it("maps Clothing to main-top", () => {
    expect(getZoneForCategory("Clothing")).toBe("main-top");
  });

  it("maps Kitchen & Food to main-middle", () => {
    expect(getZoneForCategory("Kitchen & Food")).toBe("main-middle");
  });

  it("maps Water to side-pockets", () => {
    expect(getZoneForCategory("Water")).toBe("side-pockets");
  });

  it("maps Tools & Utility to brain", () => {
    expect(getZoneForCategory("Tools & Utility")).toBe("brain");
  });

  it("is case-insensitive", () => {
    expect(getZoneForCategory("SHELTER")).toBe("external");
    expect(getZoneForCategory("clothing")).toBe("main-top");
  });

  it("defaults unknown categories to main-middle", () => {
    expect(getZoneForCategory("Random Stuff")).toBe("main-middle");
  });
});

describe("getZoneForItem", () => {
  it("returns worn zone when item is worn", () => {
    expect(getZoneForItem("Clothing", true)).toBe("worn");
  });

  it("returns category zone when not worn", () => {
    expect(getZoneForItem("Clothing", false)).toBe("main-top");
  });

  it("defaults to main-middle when no category", () => {
    expect(getZoneForItem(undefined, false)).toBe("main-middle");
  });
});
