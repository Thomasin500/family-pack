# Family Pack — Bug List

> Active bugs and UX issues. Fix as time allows, prioritize by user impact.

**Last updated:** April 16, 2026

---

## Open

### Theme

- [ ] **Dark theme is too dark** — Lighten the dark mode backgrounds and surfaces
- [ ] **Light theme is too bright** — Darken the light mode to reduce glare

### Weight Units

- [ ] **Separate unit settings for totals vs individual items** — Right now the unit toggle changes everything at once. Goal: totals stay in lb (or a chosen "totals unit") while individual item weights can be viewed in oz/g/etc. Two-axis preference: `itemsUnit` + `totalsUnit`.

### Trip Planner

- [ ] **Trip pack totals placement** — Totals currently sit at the bottom of the pack card. Consider moving them (or mirroring them) to the top so they're visible without scrolling on long packs.

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
- Theme preference is persisted in a cookie + localStorage and read server-side by the root layout — dark-mode flash on load is gone and the toggle no longer needs two clicks to take effect. Inline `<script>` handles cookie-less visitors (migrates from legacy localStorage).
- Pack-class and pet-carry tiers now share one green → yellow → orange → red color scale via `packClassColor`. Hyperlight tier was briefly introduced (with a teal/sky accent) and then removed — defaults are back to four tiers with cut-offs at 10 / 20 / 30 lb.
- Trip pack collapsed categories keep the item count + subtotal visible; only the Sort menu hides until the category is expanded.
- Collapse-all / Expand-all button added to the gear closet (top right) and each trip pack column header.
- % body-weight display has an inline color gradient with a hover legend showing the four tiers (Comfortable / OK / Warn / Overloaded) and their thresholds from household settings.
- Edit-trip dialog now normalizes `startDate` / `endDate` to `YYYY-MM-DD` so the end-date picker pre-fills correctly when the API returns an ISO timestamp. New-trip modal mirrors start → end when end is empty; both dialogs set `min={startDate}` so end can't precede start.
- Household settings page: every section (Pack class / Human carry / Pet carry) is now a multi-thumb slider with colored regions. Changes auto-save (500ms debounce) and each section shows its own inline Saving… / Saved / error pill next to the section header; Saved pill auto-dismisses after 2.5s.
- Gear categories are edited inline on the settings page — the popup version only lives in the closet now.
- Season removed from the trip new/edit forms (the DB column and validator stay for backward compatibility). Terrain relabeled to Notes and expanded to a textarea.
- Nav "New Trip" button now opens the trips page with the new-trip modal already open (`/app/trips?new=true`). Closing the modal strips the param.
- Changelog drawer groups entries by date (no time) and caps the visible list at the 10 newest items with a "Show N older changes" toggle.
