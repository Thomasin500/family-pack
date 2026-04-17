# Family Pack — Bug List

> Active bugs and UX issues. Fix as time allows, prioritize by user impact.

**Last updated:** April 17, 2026

---

## Open

### Weight Units

- [ ] **Separate unit settings for totals vs individual items** — Right now the unit toggle changes everything at once. Goal: totals stay in lb (or a chosen "totals unit") while individual item weights can be viewed in oz/g/etc. Two-axis preference: `itemsUnit` + `totalsUnit`.

### Items

- [ ] **Expose `allowMultiple` at item create/edit time** — Stackable items currently require creating the item first, then flipping the Layers icon in the closet. Add an "Allow multiple in a single pack" checkbox to the add/edit item dialog so it can be set up front.

---

## Design questions (still open)

- [ ] **What should the dashboard show long-term?** Today it's mostly the Household panel + invite code. Phase 5.5 adds "upcoming trip" and "most recent pack" tiles, but what else earns dashboard real estate? Readiness summary? Carry-balance warnings across active trips? Gear-history highlights? Household weight-trend chart? Needs a point-of-view before building.
- [ ] **Should trip pack totals be at the top of each card?** Currently at the top (moved from the bottom April 17). Open question whether to mirror them (top + bottom), leave top-only, or move back. Also: do totals shrink on scroll into a sticky header, or stay static?
- [ ] **Food pantry vs trip-only food?** Extension of the existing food/water Q — is food a first-class "pantry" entity separate from gear and from trips, or just trip-scoped consumables? A pantry would let you reuse meal definitions across trips; trip-only keeps the data model simple.
- [ ] **Food in the closet?** Food isn't really "stored" gear — it's trip-specific. Should food live only in trips, or should there be a "consumables" section that gets added per-trip? Consider: template meals, per-trip food entries, or a separate food planning flow.
- [ ] **Water weight?** Similar to food — water is trip-specific consumable weight. Track water containers as gear (closet) and water volume as trip consumable? Or just track filled container weight per trip?
- [ ] **Food weight guessamator?** Instead of (or alongside) logging individual food items, let the user estimate food weight from trip duration + calories/day + packaging assumptions. Quick rough number for planning without full meal library.
- [ ] **Item details modal — click-to-assign vs click-for-details.** Gear Pool chips currently assign on click (and support drag). Adding a details modal means deciding the gesture: details on icon button? on long-press? on hover-then-click? Single click shouldn't do both.
- [ ] **Light vs dark default** — Currently defaults to dark. Is that the right first impression, or should it follow system preference by default? (Separate from the first-click bug above.)

---

## Recently fixed (kept for memory)

- **Light theme picked up a subtle warm-brown tint.** After a too-sage pass and a too-tan pass, settled on a near-original off-white ramp with R > G throughout, plus a small overall darken so it doesn't glare.
- **Dark theme lightened further and pushed toward sage.** Two passes today — first +6-8 points across the ramp, then another +8 with a green bias. Primary accent warmed up. Same moody personality, much easier on the eyes.
- **Pack class labels on pack headers.** Humans show Ultralight / Lightweight / Traditional / Heavy under their name in the pack column header, color-coded on the same green → red ramp. Pets show Trail Runner / Trail Partner / Pack Dog / Overloaded derived from carry %. Both use household-settings tiers.
- **Leaving a household no longer takes pets/children with you.** They belong to the household, not to the adult who originally added them. `managedByUserId` is now purely audit — all behavioral uses are gone.
- **Pet creation revamp** — New `PetDialog` replaces the inline form on the dashboard. Fields: Name, Weight (unit-aware), Age (stored as birthDate so it ages forward naturally), Breed. Edit uses the same dialog. Any household adult can now manage pets and children — `managedByUserId` is no longer a permission gate for non-adult roles.
- **Trip pack totals moved to the top** — Base / Total Carried / Skin-Out / % Body Wt render above the category list on every pack card. Collapsed state already showed them compactly; nothing changed there.
- **Body-wt tier legend is now a hover tooltip on the percent itself** — removed the standalone 4-color bar next to the "% Body Wt" label. The colored percent value is the hover target now.
- **Gear Pool** replaces the thin unassigned-shared bar at the top of every trip. Search by name/brand/model, filter by owner/category/worn/consumable, sort by type/name/weight. Click-to-assign preserved alongside full drag-and-drop.
- **Stackable items** — new `allowMultiple` flag on gear items (toggle via the Layers icon in the closet). Stackable items stay in the Gear Pool after being added to a pack and can be assigned to multiple packs (water bottles, fuel, food per day).
- **Drag-and-drop trip building** — pool → pack, pack → pack (preserving ownership for "carrying for" badges), pack → pool to unassign, intra-pack reorder via grip handle. `/` focuses the pool search. Deep-link via `#pack-<packId>`.
- **Mutation error toasts** — every save across the app now surfaces a red toast on failure. Covers items, trips, trip members, categories, household, and all pack-item operations. Structured 409 responses (item-in-use, category-has-items) still route through their dedicated dialogs without double-toasting.
- **Cross-household security audit** — eight cross-household reference holes closed across write endpoints. Every endpoint that takes a foreign ID (memberIds, userId, itemId, categoryId, moveTo) re-verifies the entity belongs to the caller's household.
- **Nav unit toggle** now looks obviously clickable — bordered pill with a rotating Repeat icon on hover and a clearer tooltip showing the cycle.
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
