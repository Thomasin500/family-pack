import { describe, it, expect } from "vitest";
import {
  packClass,
  packClassLabel,
  petClass,
  petClassLabel,
  resolveSettings,
  DEFAULT_SETTINGS,
} from "../household-settings";
import { lbToGrams } from "../weight";

describe("packClass (humans)", () => {
  const tiers = DEFAULT_SETTINGS.packClassGrams;

  it("classifies under-10-lb as ultralight", () => {
    expect(packClass(lbToGrams(5), tiers)).toBe("ultralight");
    expect(packClass(lbToGrams(9.9), tiers)).toBe("ultralight");
  });

  it("classifies 10-20 lb as lightweight", () => {
    expect(packClass(lbToGrams(10), tiers)).toBe("lightweight");
    expect(packClass(lbToGrams(19.9), tiers)).toBe("lightweight");
  });

  it("classifies 20-30 lb as traditional", () => {
    expect(packClass(lbToGrams(20), tiers)).toBe("traditional");
    expect(packClass(lbToGrams(29.9), tiers)).toBe("traditional");
  });

  it("classifies 30+ lb as heavy", () => {
    expect(packClass(lbToGrams(30), tiers)).toBe("heavy");
    expect(packClass(lbToGrams(50), tiers)).toBe("heavy");
  });

  it("labels render correctly", () => {
    expect(packClassLabel("ultralight")).toBe("Ultralight Pack");
    expect(packClassLabel("lightweight")).toBe("Lightweight Pack");
    expect(packClassLabel("traditional")).toBe("Traditional Pack");
    expect(packClassLabel("heavy")).toBe("Heavy Pack");
  });
});

describe("petClass (pets)", () => {
  const tiers = DEFAULT_SETTINGS.petCarryPercent; // ok: 10, warn: 15, max: 20

  it("classifies <10% as trail-runner", () => {
    expect(petClass(0, tiers)).toBe("trail-runner");
    expect(petClass(9.9, tiers)).toBe("trail-runner");
  });

  it("classifies 10-15% as trail-partner", () => {
    expect(petClass(10, tiers)).toBe("trail-partner");
    expect(petClass(14.9, tiers)).toBe("trail-partner");
  });

  it("classifies 15-20% as pack-dog", () => {
    expect(petClass(15, tiers)).toBe("pack-dog");
    expect(petClass(19.9, tiers)).toBe("pack-dog");
  });

  it("classifies >=20% as overloaded", () => {
    expect(petClass(20, tiers)).toBe("overloaded");
    expect(petClass(35, tiers)).toBe("overloaded");
  });

  it("labels render correctly", () => {
    expect(petClassLabel("trail-runner")).toBe("Trail Runner");
    expect(petClassLabel("trail-partner")).toBe("Trail Partner");
    expect(petClassLabel("pack-dog")).toBe("Pack Dog");
    expect(petClassLabel("overloaded")).toBe("Overloaded");
  });

  it("respects household overrides", () => {
    const strictTiers = { ok: 5, warn: 8, max: 12 };
    expect(petClass(4, strictTiers)).toBe("trail-runner");
    expect(petClass(6, strictTiers)).toBe("trail-partner");
    expect(petClass(10, strictTiers)).toBe("pack-dog");
    expect(petClass(12, strictTiers)).toBe("overloaded");
  });
});

describe("resolveSettings legacy migration", () => {
  it("collapses v1 `light` tier onto the new `lightweight` bound", () => {
    const legacy = {
      packClassGrams: {
        ultralight: lbToGrams(8),
        lightweight: lbToGrams(14),
        light: lbToGrams(18), // v1 had a 5th tier
        traditional: lbToGrams(28),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolved = resolveSettings(legacy as any);
    expect(resolved.packClassGrams.ultralight).toBe(lbToGrams(8));
    expect(resolved.packClassGrams.lightweight).toBe(lbToGrams(18)); // from v1.light
    expect(resolved.packClassGrams.traditional).toBe(lbToGrams(28));
  });

  it("drops v2 `hyperlight` tier", () => {
    const legacy = {
      packClassGrams: {
        hyperlight: lbToGrams(6),
        ultralight: lbToGrams(10),
        lightweight: lbToGrams(20),
        traditional: lbToGrams(30),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolved = resolveSettings(legacy as any);
    expect(resolved.packClassGrams.ultralight).toBe(lbToGrams(10));
    expect(resolved.packClassGrams.lightweight).toBe(lbToGrams(20));
    expect(resolved.packClassGrams.traditional).toBe(lbToGrams(30));
  });

  it("falls back to defaults when settings is null", () => {
    const resolved = resolveSettings(null);
    expect(resolved).toEqual(DEFAULT_SETTINGS);
  });
});
