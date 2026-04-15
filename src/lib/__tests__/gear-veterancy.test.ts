import { describe, it, expect } from "vitest";
import { getVeterancyLevel, getVeterancyColor } from "../gear-veterancy";

describe("getVeterancyLevel", () => {
  it("returns New for 0 trips", () => {
    expect(getVeterancyLevel(0)).toBe("New");
  });

  it("returns Breaking In for 1-2 trips", () => {
    expect(getVeterancyLevel(1)).toBe("Breaking In");
    expect(getVeterancyLevel(2)).toBe("Breaking In");
  });

  it("returns Trusted for 3-5 trips", () => {
    expect(getVeterancyLevel(3)).toBe("Trusted");
    expect(getVeterancyLevel(5)).toBe("Trusted");
  });

  it("returns Veteran for 6-10 trips", () => {
    expect(getVeterancyLevel(6)).toBe("Veteran");
    expect(getVeterancyLevel(10)).toBe("Veteran");
  });

  it("returns Legendary for 11+ trips", () => {
    expect(getVeterancyLevel(11)).toBe("Legendary");
    expect(getVeterancyLevel(50)).toBe("Legendary");
  });
});

describe("getVeterancyColor", () => {
  it("returns a color string for each level", () => {
    expect(getVeterancyColor("New")).toBeTruthy();
    expect(getVeterancyColor("Breaking In")).toBeTruthy();
    expect(getVeterancyColor("Trusted")).toBeTruthy();
    expect(getVeterancyColor("Veteran")).toBeTruthy();
    expect(getVeterancyColor("Legendary")).toBeTruthy();
  });

  it("returns different colors for different levels", () => {
    const colors = new Set([
      getVeterancyColor("New"),
      getVeterancyColor("Breaking In"),
      getVeterancyColor("Trusted"),
      getVeterancyColor("Veteran"),
      getVeterancyColor("Legendary"),
    ]);
    expect(colors.size).toBe(5);
  });
});
