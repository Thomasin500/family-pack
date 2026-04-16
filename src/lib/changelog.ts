export interface ChangelogEntry {
  date: string; // YYYY-MM-DD
  title: string;
  items: string[];
}

// Newest first.
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-04-16",
    title: "Confirm dialogs",
    items: [
      "Delete and remove prompts are now centered modals with a dimmed backdrop — easier to see and harder to miss-click.",
      "Covers item delete, category delete, trip delete, remove-from-pack, and trip-member removal.",
      "Success toasts (saved, duplicated, etc.) stay small in the corner.",
    ],
  },
  {
    date: "2026-04-16",
    title: "Closet polish pass",
    items: [
      "Saving a new item as Shared from a person's tab now works.",
      "Uncategorizing an item via inline edit no longer errors.",
      "Add Item dialog respects your current weight unit (oz/lb/g/kg).",
      "Weight inputs allow 2 decimal places.",
      "Confirmation toasts are bigger and center-top.",
      "Removed weight totals from the closet (only trips show totals now).",
      "Closet items stay put when you edit them; click the sort icon on a category header to sort by name or weight.",
      "Collapsed category totals are now larger and easier to scan.",
      "Dashboard greets the signed-in user (not just the first household member).",
      "Changelog footer added.",
    ],
  },
];
