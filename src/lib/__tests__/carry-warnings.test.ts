import { describe, it, expect } from "vitest";
import { getCarryWarning } from "../carry-warnings";

describe("getCarryWarning — adult", () => {
  it("returns light for < 15%", () => {
    expect(getCarryWarning(10, "adult").status).toBe("light");
    expect(getCarryWarning(0, "adult").status).toBe("light");
    expect(getCarryWarning(14.9, "adult").status).toBe("light");
  });

  it("returns moderate for 15-19.9%", () => {
    expect(getCarryWarning(15, "adult").status).toBe("moderate");
    expect(getCarryWarning(19.9, "adult").status).toBe("moderate");
  });

  it("returns heavy for 20-24.9%", () => {
    expect(getCarryWarning(20, "adult").status).toBe("heavy");
    expect(getCarryWarning(24.9, "adult").status).toBe("heavy");
  });

  it("returns overloaded for >= 25%", () => {
    expect(getCarryWarning(25, "adult").status).toBe("overloaded");
    expect(getCarryWarning(35, "adult").status).toBe("overloaded");
  });

  it("includes label and color", () => {
    const warning = getCarryWarning(22, "adult");
    expect(warning.label).toBe("Heavy");
    expect(warning.color).toContain("orange");
  });
});

describe("getCarryWarning — child", () => {
  it("uses the same thresholds as adults", () => {
    expect(getCarryWarning(14, "child").status).toBe("light");
    expect(getCarryWarning(16, "child").status).toBe("moderate");
    expect(getCarryWarning(22, "child").status).toBe("heavy");
    expect(getCarryWarning(26, "child").status).toBe("overloaded");
  });
});

describe("getCarryWarning — pet", () => {
  it("returns light for < 10%", () => {
    expect(getCarryWarning(5, "pet").status).toBe("light");
    expect(getCarryWarning(9.9, "pet").status).toBe("light");
  });

  it("returns moderate for 10-14.9%", () => {
    expect(getCarryWarning(10, "pet").status).toBe("moderate");
    expect(getCarryWarning(14, "pet").status).toBe("moderate");
  });

  it("returns heavy for 15-19.9%", () => {
    expect(getCarryWarning(15, "pet").status).toBe("heavy");
    expect(getCarryWarning(19, "pet").status).toBe("heavy");
  });

  it("returns overloaded for >= 20%", () => {
    expect(getCarryWarning(20, "pet").status).toBe("overloaded");
    expect(getCarryWarning(25, "pet").status).toBe("overloaded");
  });

  it("has stricter thresholds than humans", () => {
    // 18% is moderate for a human but heavy for a pet
    expect(getCarryWarning(18, "adult").status).toBe("moderate");
    expect(getCarryWarning(18, "pet").status).toBe("heavy");
  });
});

describe("getCarryWarning — status colors are distinct", () => {
  it("each status has a unique color", () => {
    const colors = new Set([
      getCarryWarning(5, "adult").color,
      getCarryWarning(16, "adult").color,
      getCarryWarning(22, "adult").color,
      getCarryWarning(30, "adult").color,
    ]);
    expect(colors.size).toBe(4);
  });
});
