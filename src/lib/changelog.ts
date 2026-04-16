export interface ChangelogEntry {
  /** ISO 8601 timestamp, e.g. "2026-04-16T14:32:00-06:00" */
  at: string;
  title: string;
  items: string[];
}

// Newest first.
export const CHANGELOG: ChangelogEntry[] = [
  {
    at: "2026-04-16T12:22:00-06:00",
    title: "Sort UX polish + calmer drawer",
    items: [
      "Default sort labeled 'Worn / Carried / Consumable' and actually groups by those types (worn first, carried, then consumables), tie-broken by name.",
      "Sort trigger always shows the same up/down sort icon so it reads as a button, not a status; the active color just shifts to indicate a non-default sort.",
      "Changelog drawer no longer dims the page or locks scroll — it's a calm bottom panel you can ignore. Toggle and close controls sit at the top of the drawer.",
    ],
  },
  {
    at: "2026-04-16T12:18:00-06:00",
    title: "Sort menus + drawer changelog",
    items: [
      "Every category (Gear Closet and each pack-column group on a trip) now has a sort menu: Default, Name A→Z, Name Z→A, Weight light→heavy, Weight heavy→light.",
      "Changelog footer now opens as a drawer from the bottom of the viewport — fixed height, list scrolls internally, backdrop dims the rest of the page.",
      "Timestamps always render in the viewer's local timezone.",
    ],
  },
  {
    at: "2026-04-16T12:10:00-06:00",
    title: "Click-outside closes editors",
    items: [
      "Inline editors (closet rows, weights, categories, body weight, pet details, shared-item assign) now close when you click outside.",
      "If you've made changes, the editor stays open and flashes a red ring with a 'Save or Cancel' message instead of silently discarding.",
      "Nav label renamed from 'Closet' to 'Gear Closet'.",
    ],
  },
  {
    at: "2026-04-16T12:00:00-06:00",
    title: "Unified trip add flow",
    items: [
      "Shared gear shows up in the per-pack Add Items dialog alongside personal gear — one flow for both.",
      "The big shared-gear panel is now a thin banner that only appears when there's shared gear nobody's carrying yet.",
      "Clicking a banner item opens the per-pack assign picker to route it to a person.",
    ],
  },
  {
    at: "2026-04-16T11:55:00-06:00",
    title: "Confirm dialogs",
    items: [
      "Delete and remove prompts are now centered modals with a dimmed backdrop — easier to see and harder to miss-click.",
      "Covers item delete, category delete, trip delete, remove-from-pack, and trip-member removal.",
      "Success toasts (saved, duplicated, etc.) stay small in the corner.",
    ],
  },
  {
    at: "2026-04-16T11:42:00-06:00",
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
