/**
 * Seed the catalog_products table from the merged catalog JSON.
 * Idempotent: skips items that already exist (by brand+model).
 * Run: npx tsx scripts/seed-catalog-merged.ts
 */
import { db } from "../src/db";
import { catalogProducts } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const MERGED_PATH = resolve(__dirname, "../data/catalog/merged-catalog.json");

interface MergedItem {
  brand: string;
  model: string;
  categorySuggestion: string | null;
  sourceCount: number;
  sources: string[];
}

async function main() {
  if (!existsSync(MERGED_PATH)) {
    console.error(`Merged catalog not found: ${MERGED_PATH}`);
    console.error("Run the catalog build pipeline first:");
    console.error("  npm run catalog:build");
    process.exit(1);
  }

  const items: MergedItem[] = JSON.parse(readFileSync(MERGED_PATH, "utf-8"));
  console.log(`Merged catalog has ${items.length} items`);

  // Get existing brand+model pairs to avoid duplicates
  const existing = await db
    .select({
      key: sql<string>`lower(${catalogProducts.brand}) || '|' || lower(${catalogProducts.model})`,
    })
    .from(catalogProducts);

  const existingKeys = new Set(existing.map((e) => e.key));
  console.log(`Database already has ${existingKeys.size} catalog entries`);

  // Filter to new items only
  const newItems = items.filter(
    (item) => !existingKeys.has(`${item.brand.toLowerCase()}|${item.model.toLowerCase()}`)
  );

  if (newItems.length === 0) {
    console.log("No new items to insert — catalog is up to date.");
    process.exit(0);
  }

  console.log(`Inserting ${newItems.length} new items...`);

  // Batch insert in chunks of 100
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
    const batch = newItems.slice(i, i + BATCH_SIZE);
    const rows = batch.map((item) => ({
      brand: item.brand,
      model: item.model,
      searchText: `${item.brand} ${item.model}`.toLowerCase(),
      categorySuggestion: item.categorySuggestion,
      source: "seed" as const,
      sourceCount: item.sourceCount,
    }));

    await db.insert(catalogProducts).values(rows);
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${newItems.length}`);
  }

  console.log(`\nDone — ${inserted} items added to catalog.`);
  console.log(`Total catalog size: ${existingKeys.size + inserted}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
