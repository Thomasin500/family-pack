/**
 * Convert an integer age in years into a birthDate string (YYYY-MM-DD).
 * The resulting date is N years before today using today's month/day, so the
 * pet/child will "have a birthday" on the same calendar date every year — a
 * reasonable approximation when only an integer age is known at entry.
 */
export function yearsToBirthDate(years: number, today: Date = new Date()): string {
  const birth = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
  const y = birth.getFullYear();
  const m = String(birth.getMonth() + 1).padStart(2, "0");
  const d = String(birth.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Compute integer age in years from a stored birthDate. Accepts `YYYY-MM-DD`
 * or a full ISO timestamp. Returns 0 for invalid input.
 */
export function birthDateToYears(birthDate: string, today: Date = new Date()): number {
  const dateStr = birthDate.includes("T") ? birthDate.split("T")[0] : birthDate;
  const [yy, mm, dd] = dateStr.split("-").map(Number);
  if (!yy) return 0;
  let years = today.getFullYear() - yy;
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hasHadBirthdayThisYear = month > mm || (month === mm && day >= (dd || 1));
  if (!hasHadBirthdayThisYear) years -= 1;
  return Math.max(0, years);
}
