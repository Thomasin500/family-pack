/**
 * Import gear items from a CSV into the production database.
 *
 * Usage:
 *   USE_NEON=true npx tsx scripts/import-gear-csv.ts data/gear-import.csv [--dry-run]
 *
 * Flags:
 *   --dry-run   Parse and validate everything but don't write to the database
 *
 * CSV format (tab-delimited):
 *   Category\tOwner\tName\tModel\tType\tWeight in oz\tWeight in lb
 *
 * Before running:
 *   1. Drop the CSV file in data/gear-import.csv (or wherever)
 *   2. Fill in CONFIG below with real UUIDs from production
 *   3. Run with USE_NEON=true to target Neon prod
 */

import { readFileSync } from "fs";
import { db } from "../src/db";
import { categories, items } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import knownBrandsData from "../data/catalog/known-brands.json";

// ── CONFIG — paste your prod UUIDs here ──

const CONFIG = {
  householdId: "ee5d8bc1-2b2f-44ba-bfe4-c78270b3619b",
  ownerMap: {
    Family: { ownerType: "shared" as const, ownerId: "ee5d8bc1-2b2f-44ba-bfe4-c78270b3619b" },
    Thomas: { ownerType: "personal" as const, ownerId: "299a6134-7bef-4a83-8573-3c7993614464" },
    Jennifer: { ownerType: "personal" as const, ownerId: "ae4425a0-9bd8-4c8d-938c-1a4e75377897" },
  } as Record<string, { ownerType: "shared" | "personal"; ownerId: string }>,
  skipOwners: ["Birch"],
};

// ── Brand matching ──

const brandList = knownBrandsData.brands.flatMap((b) => [b.canonical, ...b.aliases]);
// Sort longest first so "Gossamer Gear" matches before "Gossamer"
brandList.sort((a, b) => b.length - a.length);

function splitBrandModel(raw: string): { brand: string | null; model: string } {
  const lower = raw.toLowerCase();
  for (const brand of brandList) {
    if (lower.startsWith(brand.toLowerCase())) {
      const rest = raw.slice(brand.length).trim();
      // Find the canonical name for this match
      const entry = knownBrandsData.brands.find(
        (b) =>
          b.canonical.toLowerCase() === brand.toLowerCase() ||
          b.aliases.some((a) => a.toLowerCase() === brand.toLowerCase())
      );
      return {
        brand: entry?.canonical ?? brand,
        model: rest || raw,
      };
    }
  }
  return { brand: null, model: raw };
}

// ── Type mapping ──

function parseType(type: string): { isWorn: boolean; isConsumable: boolean } {
  const t = type.trim().toLowerCase();
  if (t === "worn") return { isWorn: true, isConsumable: false };
  if (t === "consumable") return { isWorn: false, isConsumable: true };
  return { isWorn: false, isConsumable: false }; // "Carried" or anything else
}

// ── Category colors (reuse from dev seed) ──

const CATEGORY_COLORS: Record<string, string> = {
  "Big Four": "#6B9E6B",
  Shelter: "#6B9E6B",
  Sleep: "#3a86ff",
  Clothing: "#9b59b6",
  "Kitchen & Food": "#ea6b1e",
  "Kitchen/Food/Water": "#ea6b1e",
  Water: "#3a86ff",
  "Tools & Utility": "#8b9388",
  Fishing: "#14b8a6",
  Electronics: "#eab308",
  "Pet Gear": "#8B6914",
  "Birch's Stuff": "#8B6914",
};

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.error(
      "Usage: USE_NEON=true npx tsx scripts/import-gear-csv.ts <path-to-csv> [--dry-run]"
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log("🔍 DRY RUN — no database writes will be made\n");
  }

  // Validate config
  if (CONFIG.householdId === "PASTE_HOUSEHOLD_ID") {
    console.error("ERROR: Fill in CONFIG with real UUIDs before running.");
    process.exit(1);
  }

  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());

  // Parse header
  const header = lines[0].split("\t").map((h) => h.trim());
  console.log("CSV columns:", header);

  const rows = lines.slice(1).map((line) => {
    const cols = line.split("\t").map((c) => c.trim());
    return Object.fromEntries(header.map((h, i) => [h, cols[i] ?? ""]));
  });

  console.log(`Parsed ${rows.length} rows from CSV`);

  // ── Lookup/create categories ──
  const existingCats = await db
    .select()
    .from(categories)
    .where(eq(categories.householdId, CONFIG.householdId));

  const catByName = new Map(existingCats.map((c) => [c.name, c]));
  let nextSortOrder = existingCats.length;

  async function getOrCreateCategory(name: string) {
    if (catByName.has(name)) return catByName.get(name)!;

    const color = CATEGORY_COLORS[name] || "#6b7280";

    if (dryRun) {
      const placeholder = {
        id: `dry-run-${name}`,
        name,
        color,
        sortOrder: nextSortOrder++,
        icon: null,
        parentCategoryId: null,
        householdId: CONFIG.householdId,
      };
      catByName.set(name, placeholder);
      console.log(`  Would create category: ${name} (${color})`);
      return placeholder;
    }

    const [created] = await db
      .insert(categories)
      .values({
        name,
        color,
        sortOrder: nextSortOrder++,
        householdId: CONFIG.householdId,
      })
      .returning();

    catByName.set(name, created);
    console.log(`  Created category: ${name} (${color})`);
    return created;
  }

  // ── Process rows ──
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const ownerName = row["Owner"] || "";
    const categoryName = row["Category"] || "";
    const itemName = row["Name"] || "";
    const modelRaw = row["Model"] || "";
    const type = row["Type"] || "Carried";
    const weightOz = parseFloat(row["Weight in oz"] || "0");

    // Skip Birch rows
    if (CONFIG.skipOwners.some((s) => ownerName.toLowerCase() === s.toLowerCase())) {
      console.log(`  Skipping (${ownerName}): ${itemName}`);
      skipped++;
      continue;
    }

    // Resolve owner
    const ownerConfig = CONFIG.ownerMap[ownerName];
    if (!ownerConfig) {
      console.error(
        `  ERROR: Unknown owner "${ownerName}" on item "${itemName}". Add to CONFIG.ownerMap.`
      );
      skipped++;
      continue;
    }

    // Category
    const category = await getOrCreateCategory(categoryName);

    // Brand/model split
    const { brand, model } = splitBrandModel(modelRaw);

    // Weight: oz to grams
    const weightGrams = Math.round(weightOz * 28.3495);

    // Type flags
    const { isWorn, isConsumable } = parseType(type);

    if (!dryRun) {
      await db.insert(items).values({
        name: itemName,
        brand,
        model,
        weightGrams,
        categoryId: category.id,
        ownerType: ownerConfig.ownerType,
        ownerId: ownerConfig.ownerId,
        isWorn,
        isConsumable,
      });
    }

    imported++;
    const brandLabel = brand ? `${brand} ${model}` : modelRaw || "(no model)";
    const prefix = dryRun ? "  [DRY]" : "  ";
    console.log(
      `${prefix}[${ownerConfig.ownerType}] ${itemName} — ${brandLabel} — ${weightOz}oz (${weightGrams}g)`
    );
  }

  console.log(
    `\n${dryRun ? "DRY RUN complete" : "Done"}. ${dryRun ? "Would import" : "Imported"}: ${imported}, Skipped: ${skipped}`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
