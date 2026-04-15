# Family Pack — Final Design System

> Extracted from Round 5 Stitch designs (April 15, 2026).
> Use these tokens when building components in v0 or implementing in the codebase.

## Color Tokens

### Core Palette

| Token                  | Hex       | Usage                                               |
| ---------------------- | --------- | --------------------------------------------------- |
| `primary`              | `#9ED49C` | Sage green — active states, primary text, badges    |
| `primary-container`    | `#6B9E6B` | Forest green — buttons, gradients, strong accents   |
| `on-primary`           | `#043911` | Text on primary buttons                             |
| `on-primary-container` | `#00330D` | Text on primary container                           |
| `secondary`            | `#FFB693` | Warm peach — secondary accents                      |
| `secondary-container`  | `#EA6B1E` | Burnt orange — Kitchen category, shared gear badges |
| `tertiary`             | `#FFB0C8` | Rose pink — clothing category                       |
| `tertiary-container`   | `#C77C94` | Muted rose — clothing borders                       |
| `error`                | `#FFB4AB` | Error states                                        |

### Surface Palette (warm olive-tinted darks)

| Token                       | Hex       | Usage                      |
| --------------------------- | --------- | -------------------------- |
| `background` / `surface`    | `#13140F` | Page background            |
| `surface-container-lowest`  | `#0E0F0A` | Deepest insets             |
| `surface-container-low`     | `#1B1C16` | Card backgrounds           |
| `surface-container`         | `#1F201A` | Secondary cards            |
| `surface-container-high`    | `#292A24` | Elevated cards, stat boxes |
| `surface-container-highest` | `#34352F` | Badges, toggles, inputs    |
| `surface-bright`            | `#393A33` | Hover states, active tabs  |

### Text & Border

| Token                | Hex       | Usage                         |
| -------------------- | --------- | ----------------------------- |
| `on-surface`         | `#E4E3D9` | Primary text (warm off-white) |
| `on-surface-variant` | `#C1C9BD` | Secondary text                |
| `outline`            | `#8B9388` | Muted labels, inactive nav    |
| `outline-variant`    | `#414940` | Borders, dividers             |

### Category Colors

| Category | Border Color                    | Text Color                     |
| -------- | ------------------------------- | ------------------------------ |
| Shelter  | `#6B9E6B` (primary-container)   | `#9ED49C` (primary)            |
| Sleep    | `#8B9388` (outline)             | `#C1C9BD` (on-surface-variant) |
| Kitchen  | `#EA6B1E` (secondary-container) | `#EA6B1E`                      |
| Clothing | `#C77C94` (tertiary-container)  | `#C77C94`                      |
| Tools    | `#414940` (outline-variant)     | `#8B9388` (outline)            |
| Pet Gear | `#8B6914`                       | `#8B6914`                      |

## Typography

| Role            | Font                         | Weight          | Usage                         |
| --------------- | ---------------------------- | --------------- | ----------------------------- |
| Body / UI       | Plus Jakarta Sans            | 400-800         | Everything                    |
| Weight data     | System mono / JetBrains Mono | 400-500         | Weight numbers, tabular data  |
| Page titles     | Plus Jakarta Sans            | 800 (extrabold) | H1 headings                   |
| Section headers | Plus Jakarta Sans            | 700-800         | Uppercase, tracking-widest    |
| Badges / labels | Plus Jakarta Sans            | 800 (extrabold) | 10px uppercase, wide tracking |

### Key Typography Rules

- `font-variant-numeric: tabular-nums` on all weight displays
- Page titles: 4xl-5xl extrabold, tight tracking
- Section headers: xs uppercase, tracking-[0.2em], bold
- Item names: sm-base bold, normal case
- Weight values: mono font, right-aligned

## Border Radius

| Element             | Radius                          |
| ------------------- | ------------------------------- |
| Cards / sections    | `0.75rem` (12px) — `rounded-xl` |
| Buttons             | `0.75rem` (12px) — `rounded-xl` |
| Inputs              | `0.5rem` (8px) — `rounded-lg`   |
| Badges              | `0.25rem` (4px) — `rounded`     |
| Pill toggles / tabs | `9999px` — `rounded-full`       |

## Component Patterns

### Nav Bar

- Sticky top, full-width, `#13140F` background
- Logo: "Family Pack" in Plus Jakarta Sans bold, `#6B9E6B` or `#F5F5F5`
- Tabs: Dashboard / Closet / Trips
- Active tab: `#9ED49C` text + 2px bottom border `#6B9E6B`
- Inactive: `#8B9388` with hover to `#9ED49C`
- Imperial/Metric: segmented pill control (rounded-full, primary-container active)
- "New Trip" button: gradient from `#6B9E6B` to `#9ED49C`

### Gear Item Row

- Full-width within category card
- Alternating bg: `surface` / `surface-container-low` (subtle zebra)
- Hover: `surface-container` or `surface-bright`
- Left: item name (bold) + badges below
- Right: weight in mono (right-aligned)
- Edit icon: appears on hover (opacity-0 -> opacity-100)

### Category Section

- Rounded card with colored left border (1.5px)
- Header: uppercase category name + item count + weight subtotal
- Quick-add input at bottom with add button

### Weight Summary Footer (Closet)

- Fixed bottom, backdrop-blur
- Base weight (primary color) + "Traditional" badge
- Total carried, skin-out, % body weight
- Dividers between stat groups

### Badges

- Type: Carried (outline bg), Worn (primary-container/20 bg), Consumable
- Veterancy: Legendary/Veteran/Trusted (on-surface-variant/10 bg)
- Shared: `#EA6B1E` bg with white text
- Pack class: Traditional (surface-container-highest bg)

### Shared Gear Pool

- Rounded card with items as draggable chips/cards
- Each chip: icon + name + weight
- Dashed border "Add" button at end

## Screen Inventory

1. **Dashboard** — Welcome, stats bento, household, active trip, quick actions, activity log
2. **Gear Closet** — Tabs, full-width category sections, item rows, sticky weight footer
3. **Trip Workspace** — Two pack columns, balance bar, shared pool, checklist toggle
4. **Trip Checklist** — Person tabs, category groups with checkboxes, sidebar stats
5. **Pack Loadout** — Worn gear sidebar, pack zone diagram, zone density, weight summary
