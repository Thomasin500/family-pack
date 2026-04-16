# Family Pack — Bug List

> Active bugs and UX issues. Fix as time allows, prioritize by user impact.

**Last updated:** April 16, 2026

---

## Open

### Theme

- [ ] **Dark theme is too dark** — Lighten the dark mode backgrounds and surfaces
- [ ] **Light theme is too bright** — Darken the light mode to reduce glare
- [ ] **Theme toggle first-click is a no-op** — The nav-bar `useState` initializer reads `document.documentElement.classList` but SSR hydration gives it the wrong initial value. First click appears to do nothing; second click toggles correctly. Fix by initializing from `localStorage("theme")` inside a `useEffect` (or reading the server-rendered class attribute).

### Weight Units

- [ ] **Separate unit settings for totals vs individual items** — Right now the unit toggle changes everything at once. Goal: totals stay in lb (or a chosen "totals unit") while individual item weights can be viewed in oz/g/etc. Two-axis preference: `itemsUnit` + `totalsUnit`.

### Trip Planner

- [ ] **End date picker shows start date** — Opening the end date field in the edit trip dialog pre-fills/shows the start date instead of the end date.
- [ ] **Pack class tier colors don't match pet carry threshold colors** — Human pack-class tiers and pet carry tiers use different palettes. They should share a color scale so the same "level" reads the same across the app.
- [ ] **"Sort by" label visible when category is collapsed** — In trip pack columns, the category subheader still renders the sort menu when the category is collapsed. Hide it (and the subtotal row) when collapsed.
- [ ] **Trip pack totals placement** — Totals currently sit at the bottom of the pack card. Consider moving them (or mirroring them) to the top so they're visible without scrolling on long packs.

### Closet

- [ ] **Drag-reorder within a category is clunky** — dnd-kit reorder on categories works; reorder within items is less polished. Left as-is until Phase 7 drag-and-drop pass.
- [ ] **Auto-sort within categories feels unpredictable** — When items are edited/added, the order can jump. Explicit per-category sort menu helps, but we want a more elegant "sort order you set is the order you see" experience with optional auto-sort modes.
- [ ] **No "collapse all" button** — Closet and trip pack columns have per-category collapse but no bulk collapse/expand. Add a single header control.
- [ ] **No legend/scale for % body weight colors** — The colored %bw badges imply a scale (green → red) but there's no visible legend explaining what weights map to which tier. Add a subtle inline scale or tooltip.

### Household & Members

- [ ] **Pet creation flow is clunky** — Current flow is inline on the dashboard and doesn't feel guided. Revamp into a proper dialog (name, breed/size, body weight, carry %, managed-by adult) with the same polish as the trip/member dialogs.

---

## Design questions (still open)

- [ ] **Food in the closet?** Food isn't really "stored" gear — it's trip-specific. Should food live only in trips, or should there be a "consumables" section that gets added per-trip? Consider: template meals, per-trip food entries, or a separate food planning flow.
- [ ] **Water weight?** Similar to food — water is trip-specific consumable weight. Track water containers as gear (closet) and water volume as trip consumable? Or just track filled container weight per trip?
- [ ] **Food weight guessamator?** Instead of (or alongside) logging individual food items, let the user estimate food weight from trip duration + calories/day + packaging assumptions. Quick rough number for planning without full meal library.
- [ ] **Trip pack totals at top or bottom of the card?** Top = always visible, bottom = reads bottom-up as a summary after you see the contents. Possibly mirror them in both places.
- [ ] **Light vs dark default** — Currently defaults to dark. Is that the right first impression, or should it follow system preference by default? (Separate from the first-click bug above.)

---

## Recently fixed (kept for memory)

- Welcome message now uses the signed-in user's name (not `members[0]`).
- Auto-sort within closet categories no longer jerks items out of view; each category has an explicit sort menu.
- Inline editing now respects click-outside with a dirty-state error banner (closet rows, weights, categories, dashboard weight/pet, shared-assign chip).
- Weight totals removed from the Gear Closet; trip tiles + per-person panels are where totals live now.
- Collapsed category totals enlarged in the closet.
- Confirmation prompts are now centered modals with a dimmed backdrop (delete item, delete trip, remove member, etc.) — everyday success toasts stay small/corner.
