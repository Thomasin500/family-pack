import { describe, it, expect } from "vitest";
import {
  gramsToOz,
  ozToGrams,
  gramsToLb,
  displayWeight,
  displayTotalWeight,
  bodyWeightPercent,
  inputToGrams,
  gramsToInput,
  unitSuffix,
  inputStep,
} from "../weight";

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

describe("displayWeight — oz mode", () => {
  it("shows oz for small weights", () => {
    expect(displayWeight(100, "oz")).toBe("3.5 oz");
  });

  it("shows oz for large weights (no auto-scale to lb)", () => {
    expect(displayWeight(1000, "oz")).toBe("35.3 oz");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "oz")).toBe("0.0 oz");
  });
});

describe("displayWeight — lb mode", () => {
  it("shows oz for weights under 1 lb", () => {
    expect(displayWeight(100, "lb")).toBe("3.5 oz");
  });

  it("shows lb + oz for weights >= 1 lb", () => {
    expect(displayWeight(1000, "lb")).toBe("2 lb 3.3 oz");
  });

  it("shows clean lb when no remainder", () => {
    expect(displayWeight(908, "lb")).toBe("2 lb");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "lb")).toBe("0.0 oz");
  });
});

describe("displayWeight — g mode", () => {
  it("shows grams (no auto-scale to kg)", () => {
    expect(displayWeight(500, "g")).toBe("500 g");
  });

  it("shows grams for large values", () => {
    expect(displayWeight(1500, "g")).toBe("1500 g");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "g")).toBe("0 g");
  });
});

describe("displayWeight — kg mode", () => {
  it("shows kg for any value", () => {
    expect(displayWeight(500, "kg")).toBe("0.50 kg");
  });

  it("shows kg for >= 1000g", () => {
    expect(displayWeight(1500, "kg")).toBe("1.50 kg");
  });

  it("shows kg at exactly 1000g", () => {
    expect(displayWeight(1000, "kg")).toBe("1.00 kg");
  });

  it("handles 0 grams", () => {
    expect(displayWeight(0, "kg")).toBe("0.00 kg");
  });
});

describe("displayWeight — legacy values", () => {
  it("imperial falls back to oz", () => {
    expect(displayWeight(100, "imperial")).toBe("3.5 oz");
  });

  it("metric falls back to g", () => {
    expect(displayWeight(500, "metric")).toBe("500 g");
  });
});

describe("inputToGrams", () => {
  it("g: passes through", () => {
    expect(inputToGrams(100, "g")).toBe(100);
  });

  it("kg: multiplies by 1000", () => {
    expect(inputToGrams(1.5, "kg")).toBe(1500);
  });

  it("oz: converts from oz", () => {
    expect(inputToGrams(1, "oz")).toBe(28);
  });

  it("lb: converts from oz (edit in oz)", () => {
    expect(inputToGrams(16, "lb")).toBe(454);
  });
});

describe("gramsToInput", () => {
  it("g: returns grams string", () => {
    expect(gramsToInput(500, "g")).toBe("500");
  });

  it("oz: returns oz string", () => {
    expect(gramsToInput(28, "oz")).toBe("0.99");
  });

  it("kg: returns kg string", () => {
    expect(gramsToInput(1500, "kg")).toBe("1.50");
  });
});

describe("unitSuffix", () => {
  it("returns correct suffixes", () => {
    expect(unitSuffix("g")).toBe("g");
    expect(unitSuffix("kg")).toBe("kg");
    expect(unitSuffix("oz")).toBe("oz");
    expect(unitSuffix("lb")).toBe("oz");
  });
});

describe("inputStep", () => {
  it("returns correct steps", () => {
    expect(inputStep("g")).toBe("1");
    expect(inputStep("kg")).toBe("0.01");
    expect(inputStep("oz")).toBe("0.1");
    expect(inputStep("lb")).toBe("0.1");
  });
});

describe("bodyWeightPercent", () => {
  it("calculates carry percentage correctly", () => {
    expect(bodyWeightPercent(5000, 25)).toBe(20);
  });

  it("returns 0 when body weight is 0", () => {
    expect(bodyWeightPercent(5000, 0)).toBe(0);
  });

  it("returns 0 when body weight is null-ish", () => {
    expect(bodyWeightPercent(5000, 0)).toBe(0);
  });
});

describe("displayTotalWeight", () => {
  it("renders in lb at pack-total scale", () => {
    // ~12 kg — typical trip base weight
    expect(displayTotalWeight(12000)).toMatch(/lb/);
  });

  it("matches the lb-mode output of displayWeight", () => {
    // Pack totals must be stable across nav unit toggling — they're always
    // the `lb` formatting regardless of what displayWeight picks otherwise.
    expect(displayTotalWeight(5000)).toBe(displayWeight(5000, "lb"));
  });

  it("under a pound falls through to oz (same as lb mode)", () => {
    // 100g → ~3.5 oz, lb output for sub-pound weights is oz-only.
    expect(displayTotalWeight(100)).toMatch(/oz/);
  });
});
