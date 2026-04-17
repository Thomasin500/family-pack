export interface ChangelogEntry {
  /** ISO 8601 timestamp, e.g. "2026-04-16T14:32:00-06:00" */
  at: string;
  title: string;
  items: string[];
}

// Newest first.
export const CHANGELOG: ChangelogEntry[] = [
  {
    at: "2026-04-17T00:15:00-06:00",
    title: "Quick wins — deep links, error toasts, tighter API scoping",
    items: [
      "Deep-link to a specific pack on a trip with `#pack-<id>` in the URL — on page load, the pack scrolls into view. Works from share links and from the 'in [name]' chips in the Gear Pool.",
      "Save failures across the app now surface a red toast instead of silently failing. Wired into every mutation hook (items, trips, trip members, categories, household, and all five pack-item operations).",
      "Security: full cross-household audit of every write endpoint. Closed five cross-household reference holes — category `moveTo`, item `categoryId` on create/update, trip `memberIds` on create, and trip member `userId` on add. All now re-verify the referenced entity belongs to the caller's household.",
      "A shared `mutationError` helper means any new mutation hook gets a proper error toast by adding one line.",
    ],
  },
  {
    at: "2026-04-16T23:55:00-06:00",
    title: "Gear Pool polish + security hardening",
    items: [
      "Press `/` anywhere on a trip to focus the Gear Pool search — auto-expands the pool if it's collapsed.",
      "New 'Packed' pill in the pool toggles a view of items already in a pack. Dimmed and strikethrough, with a 'in [name]' badge. Click one to scroll straight to the pack carrying it.",
      "Mobile drag handles are now always visible (they faded on hover only, which didn't work on touch screens).",
      "Drag mutations now surface an error toast if anything fails server-side — no more silent drag failures.",
      "Security: all three pack-item endpoints (add, bump, move) now re-verify that the item belongs to your household before creating or moving pack items. Prevents cross-household item references via guessed UUIDs.",
      "Accessibility: filter pills in the pool now report aria-pressed so screen readers announce their on/off state.",
    ],
  },
  {
    at: "2026-04-16T23:30:00-06:00",
    title: "Drag-and-drop trip building",
    items: [
      "Drag items from the Gear Pool straight onto any pack — one gesture replaces the old click-to-assign flow (but click still works the same way).",
      "Drag items between packs to reassign carriers. Owned-by stays intact, so moving Thomas's personal item into Partner's pack shows a 'Shared / Thomas' badge automatically.",
      "Drag an item from a pack back onto the Gear Pool to unassign it. For stackable items (water bottles, fuel canisters), the pool drop decrements the quantity and only fully removes when it hits zero.",
      "Drag items up or down inside a pack to reorder them. A grip handle shows up on the left of each row on hover. Mobile: long-press to start the drag instead of the grip.",
      "New 'Manual order' sort mode (drag icon) in each pack category — items display in the order you dragged them. Other sort modes still work the same.",
      "Pool auto-expands when you start dragging a pack item, so the 'drop here to unassign' target is always visible.",
      "Visual affordances: dragging an item dims the source chip, hovered pack columns glow primary, and a DragOverlay shows a floating clone under the cursor.",
      "Checklist mode disables drag — the screen is about verifying your pack, not editing it.",
      "New endpoints: POST /api/trips/[id]/packs/[packId]/items/bump (upsert: create or increment quantity) and POST /api/trips/[id]/move-item (atomic transfer preserving ownedByUserId).",
    ],
  },
  {
    at: "2026-04-16T22:00:00-06:00",
    title: "Gear Pool + stackable items",
    items: [
      "New Gear Pool panel at the top of every trip replaces the thin 'unassigned shared' bar. Search by name/brand/model, filter by owner or category, filter to Worn or Consumable only, and sort by type / name / weight. Items are grouped by category with unassigned shared gear pinned to the top of each group in primary-colored chips.",
      "Pool auto-expands when there's unassigned shared gear; otherwise collapses to a single-line summary you can click to open.",
      "Unit toggle in the nav now looks like a button: bordered pill with a rotating repeat icon on hover and a clearer tooltip showing the current unit and the cycle order.",
      "New 'stackable' flag (aka allowMultiple) on gear items — click the small Layers icon on an item in the closet to toggle. Stackable items stay in the Gear Pool after being added to a pack so you can assign them to multiple packs (water bottles, fuel canisters, food-per-day items).",
    ],
  },
  {
    at: "2026-04-16T17:45:00-06:00",
    title: "Tier sliders, theme persistence, and trip form polish",
    items: [
      "Household settings page now uses a single multi-thumb slider for each of Pack class / Human carry / Pet carry — drag the handles to set tier boundaries. Colored regions read left-to-right green → red (Pack class: 4 tiers Ultralight / Lightweight / Traditional / Heavy).",
      "Settings auto-save as you drag. A chunky Saving… → Saved pill appears next to the section header you just changed and disappears after 2.5s.",
      "Gear categories are now edited inline on the settings page (no more popup). The closet still opens it as a dialog.",
      "Theme preference is now stored in a cookie + localStorage. SSR renders the correct class immediately, so the dark → light flash on load is gone and the toggle no longer needs two clicks to take effect.",
      "Pack-class colors now match the carry-warning scale (green → yellow → orange → red) so 'lighter is better' reads the same everywhere.",
      "New Trip button in the nav opens the trips page with the modal pre-open — works from any screen.",
      "End date picker in the new-trip modal mirrors start → end when end is empty, and both dialogs prevent end < start. Existing trips also load the date correctly now (was breaking on ISO timestamps).",
      "Season field removed from the trip forms. Sort by newest / oldest in the trip list already covers what season did for grouping.",
      "Terrain field renamed to Notes and expanded to a multi-line textarea — jot route, weather, or anything worth remembering.",
      "Collapse-all / Expand-all button added to the gear closet and each trip pack column header.",
      "Trip pack categories keep their item count + subtotal visible when collapsed; only the sort menu hides.",
      "% Body-weight badge on each pack gained a tiny gradient legend to its left — hover to see the four carry tiers and where they kick in, driven by your household settings.",
      "Changelog drawer groups entries by date (no time) and shows the top 10 changes by default with a '…Show N older' link for the rest.",
    ],
  },
  {
    at: "2026-04-16T14:45:00-06:00",
    title: "Household settings + trip category polish",
    items: [
      "New Household Settings page (/app/settings/household): tune pack-class tiers (Ultralight/Lightweight/Light/Traditional cut-offs in lb), human carry % thresholds, and pet carry % thresholds. Reset to defaults any time.",
      "Category manager relocated — still accessible from the closet too, now also from settings. Shared list of household categories shown inline.",
      "Trip tile base-weight color scale now reads from your household settings (not hard-coded).",
      "Trip view: every category is collapsible with a bigger, bolder header, item count + subtotal weight, and the sort menu on the right.",
      "Gear item names no longer truncate — they wrap. Hover shows the full title too.",
      "Item weight now sits at the far right, with the delete ✕ button to the right of the weight (appears on hover).",
      "Dashboard has a small 'Household settings →' link below the quick actions.",
    ],
  },
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
