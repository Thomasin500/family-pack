import { describe, it, expect } from "vitest";
import { gramsToOz, ozToGrams, gramsToLb, displayWeight, bodyWeightPercent } from "../weight";

describe("gramsToOz", () => {
  it("converts 0 grams", () => {
    expect(gramsToOz(0)).toBe(0);
  });

  it("converts 28.3495g to ~1oz", () => {
    expect(gramsToOz(28.3495)).toBeCloseTo(1, 2);
  });

  it("converts 453.592g to ~16oz", () => {
    expect(gramsToOz(453.592)).toBeCloseTo(16, 1);
  });
});

describe("ozToGrams", () => {
  it("converts 0 oz", () => {
    expect(ozToGrams(0)).toBe(0);
  });

  it("converts 1oz to ~28g", () => {
    expect(ozToGrams(1)).toBe(28);
  });

  it("rounds to nearest gram", () => {
    expect(ozToGrams(0.5)).toBe(14);
  });
});

describe("gramsToLb", () => {
  it("converts 453.592g to ~1lb", () => {
    expect(gramsToLb(453.592)).toBeCloseTo(1, 2);
  });
});

describe("displayWeight — imperial", () => {
  it("shows oz for small weights", () => {
    expect(displayWeight(100, "imperial")).toBe("3.5 oz");
  });

  it("shows lb + oz for weights >= 32oz (907g)", () => {
    expect(displayWeight(1000, "imperial")).toBe("2 lb 3.3 oz");
  });

  it("shows clean lb when no remainder", () => {
    // 908g = 32.03oz which triggers the lb display
    expect(displayWeight(908, "imperial")).toBe("2 lb");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "imperial")).toBe("0.0 oz");
  });
});

describe("displayWeight — metric", () => {
  it("shows grams for < 1000g", () => {
    expect(displayWeight(500, "metric")).toBe("500 g");
  });

  it("shows kg for >= 1000g", () => {
    expect(displayWeight(1500, "metric")).toBe("1.5 kg");
  });

  it("shows kg at exactly 1000g", () => {
    expect(displayWeight(1000, "metric")).toBe("1.0 kg");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "metric")).toBe("0 g");
  });
});

describe("bodyWeightPercent", () => {
  it("calculates carry percentage correctly", () => {
    // 5000g carry / 25kg body = 5000 / 25000 * 100 = 20%
    expect(bodyWeightPercent(5000, 25)).toBe(20);
  });

  it("returns 0 when body weight is 0", () => {
    expect(bodyWeightPercent(5000, 0)).toBe(0);
  });

  it("returns 0 when body weight is null-ish", () => {
    expect(bodyWeightPercent(5000, 0)).toBe(0);
  });
});
