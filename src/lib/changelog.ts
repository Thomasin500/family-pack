export interface ChangelogEntry {
  /** ISO 8601 timestamp, e.g. "2026-04-16T14:32:00-06:00" */
  at: string;
  title: string;
  items: string[];
}

// Newest first.
export const CHANGELOG: ChangelogEntry[] = [
  {
    at: "2026-04-16T13:50:00-06:00",
    title: "Collapsed packs + trip tile weights + editable suggestions",
    items: [
      "Collapsed pack columns on a trip still show the full stats panel (Base / Carried / Skin-Out / %BW) — the gear list + outer card frame are what actually collapse.",
      "Trip list tiles now show Base / Carried / Skin-Out weight in a 3-column mini panel, plus an item count.",
      "Roadmap suggestions can be edited inline by their author — pencil icon on hover. Status can be changed by any household member later once admin UI ships.",
      "Added a dedicated 'Add general suggestion' button next to the General Suggestions section.",
      "Changelog drawer: the whole footer strip (and the open drawer's title bar) now opens or closes on click. Roadmap button stays pinned to the far right and doesn't toggle.",
    ],
  },
  {
    at: "2026-04-16T13:35:00-06:00",
    title: "Roadmap suggestions + header tweaks",
    items: [
      "Every household member can submit roadmap suggestions — global 'Suggest an edit' button and a per-phase one that pre-fills the phase.",
      "Suggestions show up at the bottom of the roadmap page, grouped by phase, visible to everyone in the household.",
      "Roadmap link in the changelog drawer/footer moved to the far right; the entire rest of the header now toggles the drawer open/closed.",
      "Roadmap header cleaned up: subheader and progress text split into two lines.",
    ],
  },
  {
    at: "2026-04-16T13:23:00-06:00",
    title: "Roadmap page",
    items: [
      "New /app/roadmap page showing every phase, status badge, and planned features — pulled from docs/roadmap.md into a typed, rendered view.",
      "Nav gained a 'Roadmap' link.",
    ],
  },
  {
    at: "2026-04-16T13:20:00-06:00",
    title: "Change item owner from the inline editor",
    items: [
      "The Gear Closet inline editor now has an Owner dropdown listing every household member plus 'Shared (household)'.",
      "Reassign an item from, say, you to your partner (or swap personal ⇄ shared) — after Save, it hops to the right tab.",
    ],
  },
  {
    at: "2026-04-16T13:15:00-06:00",
    title: "Leave household (take your gear with you)",
    items: [
      "New 'Leave Household' button on the dashboard. Your personal items and any pets / kids you manage move with you — shared gear and trips stay with the household.",
      "After leaving, you land on the household setup screen still signed in. Joining or creating another household re-imports your gear automatically.",
      "Added a session-invalidation helper for admin-driven member removal (wired into the existing member DELETE path for future adult-removal flows).",
    ],
  },
  {
    at: "2026-04-16T12:55:00-06:00",
    title: "Security + schema hygiene pass",
    items: [
      "Catalog typeahead 'select' now requires auth so only signed-in users can bump catalog popularity.",
      "/api/health stopped leaking total user count and no longer scans the users table.",
      "Security headers added site-wide: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin, Permissions-Policy, and 2-year HSTS with preload.",
      "Foreign keys now have explicit ON DELETE SET NULL so deleting a user / household / category / catalog product no longer leaves dangling references.",
    ],
  },
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
