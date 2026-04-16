# Family Pack — Bug List

> Active bugs and UX issues. Fix as time allows, prioritize by user impact.

**Last updated:** April 15, 2026

---

## UI / UX Bugs

### Dashboard

- [ ] **Welcome message should show current user's name** — "Welcome back" greeting should say "Welcome back, Thomas" using the signed-in user's name

### Closet

- [ ] **Auto-sort on category items is confusing** — Items within categories sort in a non-intuitive order
- [ ] **Item sorting/ordering needs better UX** — Need a more elegant way to sort and reorder items within the closet (current dnd-kit reorder is clunky)
- [ ] **Editing row should cancel on blur** — When focus moves away from an inline-editing row, it should exit edit mode. If changes were made, show a clear warning/error instead of silently discarding
- [ ] **Remove weight totals from closet** — Weight summary footer is unnecessary in the closet view; only show weight totals in trip planner
- [ ] **Category collapsed totals too small** — Make the item count + weight text in collapsed category headers larger and more readable

### Trip Planner

- [ ] **End date picker shows start date** — Opening the end date field in the edit trip dialog pre-fills/shows the start date instead of the end date
- [ ] **Confirmation toasts too small and off to the side** — Toasts (delete confirmations, etc.) should be larger and centered on screen for better visibility

### Weight Units

- [ ] **Separate unit settings for totals vs individual items** — Allow different display units for item weights (e.g., oz) and totals/summaries (e.g., lb). Currently one global unit for everything

### Theme

- [ ] **Dark theme is too dark** — Lighten the dark mode backgrounds and surfaces
- [ ] **Light theme is too bright** — Darken the light mode to reduce glare

---

## Design Questions (need decisions)

- [ ] **How to handle food in the closet?** — Food isn't really "stored" gear — it's trip-specific. Should food items live only in trips, or should there be a "consumables" section in the closet that gets added per-trip? Consider: template meals, per-trip food entries, or a separate food planning flow.
- [ ] **How to handle water weight?** — Similar to food — water is trip-specific consumable weight. Need to decide: track water containers as gear (closet) and water volume as trip consumable? Or just track filled container weight per trip?
