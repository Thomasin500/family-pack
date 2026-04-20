# Family Pack — Bug List

> Active bugs and UX issues. Fix as time allows, prioritize by user impact.

**Last updated:** April 19, 2026

---

## Open

### Weight Units

- [ ] **Separate unit settings for totals vs individual items** — Right now the unit toggle changes everything at once. Goal: totals stay in lb (or a chosen "totals unit") while individual item weights can be viewed in oz/g/etc. Two-axis preference: `itemsUnit` + `totalsUnit`. **Deferred past Phase 5** — touches too many surfaces to bundle with stats work.
- [ ] **Trip totals should always render in lb (interim fix)** — Until the full items/totals split lands, every trip pack total (Base / Carried / Skin-Out) + trip-tile totals should force-render in lb regardless of the nav unit toggle. The nav toggle would then only flip _item_ weights. Tactical fix that keeps totals readable.

### Gear Closet — inline editing

- [ ] **Notes edits don't trigger the unsaved-changes warning.** Typing in the notes field without changing other fields lets you click outside and silently lose the edit. Notes should participate in `isDirty`.
- [ ] **`allowMultiple` toggle isn't part of the unsaved-changes warning either.** Flipping the Layers icon while the row is in edit mode should mark the row dirty.
- [ ] **Save / Cancel buttons on the inline weight editor have no hit target.** Clicking on them does nothing — they appear to render but no click handler fires (or the click target is too small / is intercepted). Verify with the closet item-table weight cell.
- [ ] **Can't delete closet items that are in a trip pack.** The API returns a 409 with a trip count, and the UI is supposed to offer "Delete Anyway" — that flow is currently either not showing or not firing the force delete. Re-verify the path.
- [ ] **Add/edit item owner picker only offers `shared` vs `personal`.** Should show every household member by name (+ Shared). Inline edit already does this (see `owner dropdown`); the create dialog lags behind.
- [ ] **Click on a row should start edit, with a larger edit surface.** Currently requires clicking the pencil / specific cells. Click-anywhere-to-edit + larger inputs would match the LighterPack-speed mental model we're aiming at.
- [ ] **Search in the closet doesn't match on worn / carried / consumable.** Users expect to search "worn" or "consumable" and see flagged items. Index those booleans into the search corpus, or expose them as pills.
- [ ] **Searching in the closet doesn't surface other members' / shared items.** Should at least be toggleable — "include everyone's gear" checkbox, with results flagged "in Partner's closet" / "Shared".

### Trips — pack UX

- [ ] **Can't remove every trip member.** Deleting the last member fails silently (or leaves a trip with no packs). Either allow 0-member trips or offer a "Delete trip?" fallback when deleting the last member.
- [ ] **Pack stats collapse lives on the right side.** The chevron / toggle should move to the left edge of the pack header to match every other collapsible in the app (Gear Pool, closet categories).
- [ ] **Base weight + Total Carried tiles aren't color-coded like % Body Wt.** Once pack class is computed we can apply the same green → red ramp to the Base Weight number. Total Carried could use the carry-warning ramp.
- [ ] **Body-weight % on the chart should be hoverable** (current tooltip only on the pack card). Applies to the per-person bar in the Trip Stats panel and the Base-Weight-Over-Time line chart.

### Sorting

- [ ] **No descending option for worn / carried type sort.** The `type` sort mode always groups worn → carried → consumable. There should be a way to flip direction.
- [ ] **Sorting UX redesign — single-button toggle.** Instead of 5 sort modes (type, name↑, name↓, weight↑, weight↓), collapse into "Sort by X" with a separate direction toggle. Applies to closet + pack columns.

### Trip stats polish (Phase 5 follow-ups)

- [ ] **Clicking a pack-total tile should drill down.** Click Base Weight → small dropdown showing the categories + weights that compose it. Click Total Carried → shows all non-worn items. Click Skin-Out → shows the remainder (worn items). Keeps the stats inline without forcing the full stats panel open.

### Nav / theme polish

- [ ] **Unit pill should grow on hover.** Currently only gets a subtle border change — a tiny scale-up would make the affordance clearer.
- [ ] **Fonts feel a touch small.** Bump body copy one step across the app (closet rows, pack rows, dashboard metadata). Headings are fine.
- [ ] **Replace the nav paw-print icon with the settings gear.** The paw in the nav has outlived its usefulness now that pets are managed through `PetDialog`.
- [ ] **Remove the "Breaking In" veterancy tag?** It fires after 1–2 trips and often feels redundant. Consider collapsing to 4 levels: New / Trusted / Veteran / Legendary.

### Household

- [ ] **Household name isn't editable, and isn't visible on the dashboard.** Make it editable on `/app/settings/household`, show it as the dashboard header ("Welcome back to <Household Name>"), and consider showing it in the trip overview.
- [ ] **Edit-member body weight belongs in Household Settings too.** It's currently only on the dashboard. `/app/settings/household` should have a member list with inline weight edit (matches where Add Pet already lives).

---

## Confirmed behavior (documented, not a bug)

- **Body-weight % is based on total _carried_ weight (not base or skin-out).** Called out because it's easy to misread. Code: `bodyWeightPercent(carriedGrams, bodyKg)` in `src/lib/weight.ts`. Used everywhere (pack card, trip tile, insights, carry warnings).

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
- [ ] **Upcoming vs historical trip split.** The trip list is one flat grid right now. Should it split into "Upcoming" (no `completedAt`, start date in the future) and "Historical" (completed OR start date in the past)? With `completedAt` already in the schema this is cheap, but the sort/filter UI needs a point-of-view.
- [ ] **"Added at" / "owned since" on closet items.** We store `createdAt` already. Should we surface it as a subtle metadata line in the closet ("Owned since Mar 2026") so users can spot ancient gear candidates for the attic? Phase 10 item attic feature would depend on this.
- [ ] **Parent/child items.** A tent is actually body + poles + stakes + footprint. Users sometimes pack just the body, sometimes the whole thing. Do we model this as a first-class relation on `items`, as a lightweight "bundle" in the catalog, or punt it entirely? First-class parent/child makes reporting accurate; bundles keep the schema simple.
- [ ] **Auto-balance: fair distribution goals.** Set a household goal ("everyone carries within 5% of each other" or "Thomas max 45 lb, Partner max 35 lb") and let the app rebalance shared gear to hit it on drag. Currently Phase 9 "Balance intelligence" implies auto-suggest, but this would go further — actually execute the redistribution.
- [ ] **Price/weight comparison tool** (Jennifer's Excel pattern). For each candidate gear swap: current item (weight, price) vs. candidate (weight, price), showing $ per oz saved. Useful during gear-shopping research. Separate from the wishlist.

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
