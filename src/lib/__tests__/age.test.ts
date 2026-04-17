import { describe, it, expect } from "vitest";
import { yearsToBirthDate, birthDateToYears } from "../age";

describe("yearsToBirthDate", () => {
  it("returns a YYYY-MM-DD string N years before the reference date", () => {
    const today = new Date(2026, 3, 17); // April 17, 2026
    expect(yearsToBirthDate(3, today)).toBe("2023-04-17");
    expect(yearsToBirthDate(0, today)).toBe("2026-04-17");
    expect(yearsToBirthDate(10, today)).toBe("2016-04-17");
  });

  it("zero-pads single-digit month and day", () => {
    const today = new Date(2026, 0, 5); // January 5
    expect(yearsToBirthDate(2, today)).toBe("2024-01-05");
  });
});

describe("birthDateToYears", () => {
  it("computes age from a YYYY-MM-DD string", () => {
    const today = new Date(2026, 3, 17);
    expect(birthDateToYears("2023-04-17", today)).toBe(3);
    expect(birthDateToYears("2016-04-17", today)).toBe(10);
  });

  it("accepts ISO timestamps and strips the time portion", () => {
    const today = new Date(2026, 3, 17);
    expect(birthDateToYears("2023-04-17T00:00:00.000Z", today)).toBe(3);
  });

  it("subtracts a year when the birthday hasn't happened yet this year", () => {
    const today = new Date(2026, 3, 17); // April 17
    expect(birthDateToYears("2020-06-01", today)).toBe(5); // June birthday, not there yet
    expect(birthDateToYears("2020-04-18", today)).toBe(5); // April 18, one day away
    expect(birthDateToYears("2020-04-17", today)).toBe(6); // today exactly
    expect(birthDateToYears("2020-04-16", today)).toBe(6); // already passed
  });

  it("returns 0 for invalid input instead of throwing", () => {
    const today = new Date(2026, 3, 17);
    expect(birthDateToYears("", today)).toBe(0);
    expect(birthDateToYears("not-a-date", today)).toBe(0);
  });

  it("never returns negative values for future birthdates", () => {
    const today = new Date(2026, 3, 17);
    expect(birthDateToYears("2030-01-01", today)).toBe(0);
  });
});

describe("yearsToBirthDate ↔ birthDateToYears round-trip", () => {
  it("preserves the age across a round-trip on the same reference date", () => {
    const today = new Date(2026, 3, 17);
    for (const age of [0, 1, 3, 7, 15]) {
      expect(birthDateToYears(yearsToBirthDate(age, today), today)).toBe(age);
    }
  });
});
