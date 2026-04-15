/**
 * Updates category colors in the database to match the design system.
 *
 * Usage:
 *   npx tsx scripts/update-category-colors.ts            # dry run
 *   npx tsx scripts/update-category-colors.ts --commit    # write to DB
 *
 * Works against whatever DATABASE_URL is configured (local or production).
 */

import { db } from "../src/db";
import { categories } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

const DRY_RUN = !process.argv.includes("--commit");

// Design system category colors (April 2026)
const COLOR_MAP: Record<string, string> = {
  "Big Four": "#6B9E6B",
  Shelter: "#6B9E6B",
  Sleep: "#3a86ff",
  Clothing: "#9b59b6",
  "Kitchen & Food": "#ea6b1e",
  Water: "#3a86ff",
  "Tools & Utility": "#8b9388",
  Fishing: "#14b8a6",
  Electronics: "#eab308",
  "Pet Gear": "#8B6914",
  "Health & Hygiene": "#c77c94",
};

async function main() {
  console.log(DRY_RUN ? "DRY RUN (pass --commit to write)\n" : "COMMIT MODE\n");

  const allCats = await db.select().from(categories);
  console.log(`Found ${allCats.length} categories across all households\n`);

  let updated = 0;
  let skipped = 0;

  for (const cat of allCats) {
    const newColor = COLOR_MAP[cat.name];
    if (!newColor) {
      console.log(`  skip: "${cat.name}" — no mapping`);
      skipped++;
      continue;
    }

    if (cat.color.toLowerCase() === newColor.toLowerCase()) {
      skipped++;
      continue;
    }

    console.log(`  ${cat.name}: ${cat.color} → ${newColor}`);

    if (!DRY_RUN) {
      await db.update(categories).set({ color: newColor }).where(eq(categories.id, cat.id));
    }

    updated++;
  }

  console.log(`\n${DRY_RUN ? "Would update" : "Updated"}: ${updated} categories`);
  console.log(`Skipped: ${skipped} (already correct or no mapping)`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
