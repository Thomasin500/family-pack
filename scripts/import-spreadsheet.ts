/**
 * Import gear from Thomas's backpacking spreadsheet into production.
 *
 * Usage:
 *   npx tsx scripts/import-spreadsheet.ts            # dry run (default)
 *   npx tsx scripts/import-spreadsheet.ts --commit    # actually write to DB
 *
 * Reads: /Users/thomasfreeman/Downloads/Backpacking Gear List & Weight Calculator.xlsx
 * Sources: "Eagles Nest 41026 - Thomas" sheet (Thomas + Birch) and "Gear & Weights - Jennifer" sheet
 */

import XLSX from "xlsx";
import { db } from "../src/db";
import { households, users, categories, items } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

// ── Config ──

const XLSX_PATH = "/Users/thomasfreeman/Downloads/Backpacking Gear List & Weight Calculator.xlsx";

// Can be overridden: HOUSEHOLD_ID=xxx npx tsx scripts/import-spreadsheet.ts
const HOUSEHOLD_ID_OVERRIDE = process.env.HOUSEHOLD_ID;

const DRY_RUN = !process.argv.includes("--commit");

// ── Category mapping (spreadsheet name → app category) ──

const CATEGORY_MAP: Record<string, string> = {
  "Big Four": "Big Four",
  "The Big Four": "Big Four",
  "The BIg Four": "Big Four",
  Clothing: "Clothing",
  clothing: "Clothing",
  "Kitchen, Food, & Water": "Kitchen & Food",
  Food: "Kitchen & Food",
  food: "Kitchen & Food",
  "Tools & Utility": "Tools & Utility",
  Utility: "Tools & Utility",
  utility: "Tools & Utility",
  Fishing: "Fishing",
  "Birch's Stuff": "Pet Gear",
  Electronics: "Electronics",
  electronics: "Electronics",
  "Health & Hygiene": "Health & Hygiene",
  "health & Hygiene": "Health & Hygiene",
  Miscellaneous: "Tools & Utility",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Big Four": "#6B9E6B",
  Shelter: "#6B9E6B",
  Sleep: "#3a86ff",
  Clothing: "#9b59b6",
  "Kitchen & Food": "#ea6b1e",
  "Tools & Utility": "#8b9388",
  Fishing: "#14b8a6",
  "Pet Gear": "#8B6914",
  Electronics: "#eab308",
  "Health & Hygiene": "#ec4899",
};

// ── Helpers ──

function ozToGrams(oz: number): number {
  return Math.round(oz * 28.3495);
}

interface GearItem {
  name: string;
  brand: string | null;
  model: string | null;
  weightGrams: number;
  categoryName: string;
  ownerType: "personal" | "shared";
  ownerKey: "thomas" | "jennifer" | "birch" | "household";
  isWorn: boolean;
  isConsumable: boolean;
}

function dedupeItems(items: GearItem[]): GearItem[] {
  const seen = new Map<string, GearItem>();
  for (const item of items) {
    // Key on name + model (lowercase) to catch duplicates
    const key = `${item.name.toLowerCase()}::${(item.model || "").toLowerCase()}::${item.ownerKey}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

// ── Parse Thomas + Birch from "Eagles Nest" sheet ──

function parseThomasSheet(wb: XLSX.WorkBook): GearItem[] {
  const ws = wb.Sheets["Eagles Nest 41026 - Thomas"];
  if (!ws) throw new Error("Sheet 'Eagles Nest 41026 - Thomas' not found");

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  const items: GearItem[] = [];

  for (const row of rows) {
    const cat = String(row[0] || "").trim();
    const name = String(row[1] || "").trim();
    const model = row[2] ? String(row[2]).trim() : null;
    const type = String(row[3] || "").trim();
    const oz = parseFloat(row[4]) || 0;

    // Skip header row, empty rows, stats rows
    if (!cat || !name || cat === "Category") continue;
    if (!CATEGORY_MAP[cat]) {
      console.warn(`  Unknown category: "${cat}" — skipping "${name}"`);
      continue;
    }

    const typeLower = type.toLowerCase();

    // Determine owner
    let ownerType: "personal" | "shared" = "personal";
    let ownerKey: GearItem["ownerKey"] = "thomas";
    let isWorn = false;
    let isConsumable = false;

    if (typeLower === "birch carries") {
      ownerKey = "birch";
    } else if (typeLower === "partner carries") {
      // Per Thomas: "most partner carries gear is household owned"
      ownerType = "shared";
      ownerKey = "household";
    } else if (typeLower === "worn") {
      isWorn = true;
    } else if (typeLower === "consumable") {
      isConsumable = true;
    }
    // "Carried", "Not Bringing" → personal, thomas (still in closet)

    // Skip items with 0 weight unless they're meaningful small items
    if (oz === 0) continue;

    // Extract brand from model if possible
    let brand: string | null = null;
    if (model) {
      const knownBrands = [
        "Nemo",
        "Kelty",
        "ULA",
        "Thermarest",
        "Arcteryx",
        "Arc'teryx",
        "Smartwool",
        "Columbia",
        "North Face",
        "Prana",
        "Mountain Hardware",
        "Darn Tough",
        "Burton",
        "Eno",
        "Petzl",
        "Trekology",
        "Osprey",
        "Sea to Summit",
        "Ruffwear",
        "Eddie Bauer",
        "Cotopaxi",
        "Berkley",
        "Jet Boil",
        "Gear Aid",
        "Balance Collection",
      ];
      for (const b of knownBrands) {
        if (model.toLowerCase().includes(b.toLowerCase())) {
          brand = b;
          break;
        }
      }
    }

    items.push({
      name: `${name}${model ? ` — ${model}` : ""}`,
      brand,
      model,
      weightGrams: ozToGrams(oz),
      categoryName: CATEGORY_MAP[cat],
      ownerType,
      ownerKey,
      isWorn,
      isConsumable,
    });
  }

  return items;
}

// ── Parse Jennifer from her sheet ──

function parseJenniferSheet(wb: XLSX.WorkBook): GearItem[] {
  const ws = wb.Sheets["Gear & Weights - Jennifer"];
  if (!ws) throw new Error("Sheet 'Gear & Weights - Jennifer' not found");

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  const items: GearItem[] = [];

  for (const row of rows) {
    const name = String(row[0] || "").trim();
    const desc = row[1] ? String(row[1]).trim() : null;
    const cat = String(row[2] || "").trim();
    const oz = parseFloat(row[3]) || 0;
    const weightType = String(row[5] || "")
      .trim()
      .toLowerCase();
    const whoCarries = String(row[6] || "")
      .trim()
      .toLowerCase();
    const packed = String(row[7] || "")
      .trim()
      .toLowerCase();

    // Skip header, empty rows
    if (!name || name === "Item" || !cat) continue;
    if (!CATEGORY_MAP[cat]) {
      console.warn(`  Unknown Jennifer category: "${cat}" — skipping "${name}"`);
      continue;
    }

    // Skip items Jennifer lists but Thomas carries (they're shared/Thomas items)
    // Items like "first aid kit" with packed="thomas pack" are shared gear
    // that Thomas physically carries. We'll import them as shared.
    let ownerType: "personal" | "shared" = "personal";
    let ownerKey: GearItem["ownerKey"] = "jennifer";

    if (packed === "thomas pack") {
      ownerType = "shared";
      ownerKey = "household";
    }

    // The tent appears on Jennifer's sheet but it's shared — she carries it
    // We already import it as shared from Thomas's sheet ("Partner Carries")
    // Skip known shared duplicates from Jennifer's sheet
    const nameLower = name.toLowerCase();
    if (
      ownerType === "personal" &&
      (nameLower.includes("nemo dagger") || (nameLower === "tent" && desc?.includes("Nemo")))
    ) {
      // Tent is already shared from Thomas's sheet
      continue;
    }

    // Jet boil also appears on both sheets as shared
    if (nameLower === "jet boil" || nameLower === "jetboil") {
      continue; // Already imported as shared from Thomas's "Partner Carries" or similar
    }

    const isWorn = weightType === "worn";
    const isConsumable = weightType === "consumable";

    // Skip zero-weight items unless they have a name worth tracking
    if (oz === 0 && !["menstrual cup", "tissues", "toilet paper"].includes(nameLower)) {
      continue;
    }

    // Extract brand from description
    let brand: string | null = null;
    if (desc) {
      const knownBrands = [
        "REI",
        "Nemo",
        "Therm-a-rest",
        "Black Diamond",
        "Mountain Hardware",
        "MH",
        "Smartwool",
        "Trekology",
        "Garmin",
        "Petzl",
        "North Face",
        "Cotopaxi",
        "Joy Walker",
        "Marmot",
      ];
      for (const b of knownBrands) {
        if (desc.toLowerCase().includes(b.toLowerCase())) {
          brand = b === "MH" ? "Mountain Hardware" : b;
          break;
        }
      }
    }

    items.push({
      name: `${name}${desc ? ` — ${desc}` : ""}`,
      brand,
      model: desc,
      weightGrams: ozToGrams(oz),
      categoryName: CATEGORY_MAP[cat],
      ownerType,
      ownerKey,
      isWorn,
      isConsumable,
    });
  }

  return items;
}

// ── Main ──

async function main() {
  console.log(
    DRY_RUN ? "🔍 DRY RUN (pass --commit to write)\n" : "💾 COMMIT MODE — writing to database\n"
  );

  // Read spreadsheet
  const wb = XLSX.readFile(XLSX_PATH);
  console.log(`Read ${wb.SheetNames.length} sheets from spreadsheet\n`);

  // Parse gear
  const thomasGear = parseThomasSheet(wb);
  const jenniferGear = parseJenniferSheet(wb);
  const allGear = dedupeItems([...thomasGear, ...jenniferGear]);

  console.log(
    `Parsed: ${thomasGear.length} Thomas/Birch/shared items, ${jenniferGear.length} Jennifer items`
  );
  console.log(`After dedup: ${allGear.length} total items\n`);

  // Look up household and users
  let household: any;

  if (HOUSEHOLD_ID_OVERRIDE) {
    [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, HOUSEHOLD_ID_OVERRIDE))
      .limit(1);
  }

  // Fallback: find by looking for Thomas Freeman user
  if (!household) {
    const allUsers = await db.select().from(users);
    const thomasUser = allUsers.find(
      (u) => u.name?.toLowerCase().includes("thomas") && u.role === "adult" && u.householdId
    );
    if (thomasUser?.householdId) {
      [household] = await db
        .select()
        .from(households)
        .where(eq(households.id, thomasUser.householdId))
        .limit(1);
    }
  }

  if (!household) {
    console.error("No household found! Set HOUSEHOLD_ID env var or ensure Thomas exists in DB.");
    process.exit(1);
  }

  const HOUSEHOLD_ID = household.id;
  console.log(`Household: ${household.name} (${HOUSEHOLD_ID})`);

  const householdUsers = await db.select().from(users).where(eq(users.householdId, HOUSEHOLD_ID));

  const thomas = householdUsers.find(
    (u) => u.name?.toLowerCase().includes("thomas") && u.role === "adult"
  );
  // Jennifer in production, "Partner" in dev seed
  const jennifer = householdUsers.find((u) => u.role === "adult" && u.id !== thomas?.id);
  const birch = householdUsers.find((u) => u.role === "pet");

  if (!thomas) {
    console.error("Thomas not found in household!");
    process.exit(1);
  }
  if (!jennifer) {
    console.error("No second adult found in household!");
    process.exit(1);
  }

  console.log(`Thomas: ${thomas.id}`);
  console.log(`Jennifer: ${jennifer.id}`);
  console.log(`Birch: ${birch ? birch.id : "NOT FOUND — will create"}\n`);

  // Resolve owner IDs
  const ownerIdMap: Record<string, string> = {
    thomas: thomas.id,
    jennifer: jennifer.id,
    household: household.id,
  };

  // Create Birch if not found
  let birchId: string;
  if (birch) {
    birchId = birch.id;
  } else if (!DRY_RUN) {
    const [newBirch] = await db
      .insert(users)
      .values({
        name: "Birch",
        role: "pet",
        bodyWeightKg: 25, // 55 lb
        breed: "Mixed",
        managedByUserId: thomas.id,
        householdId: household.id,
      })
      .returning();
    birchId = newBirch.id;
    console.log(`Created Birch: ${birchId}`);
  } else {
    birchId = "DRY-RUN-BIRCH-ID";
    console.log("Would create Birch (pet user)");
  }
  ownerIdMap.birch = birchId;

  // Ensure categories exist
  const existingCats = await db
    .select()
    .from(categories)
    .where(eq(categories.householdId, HOUSEHOLD_ID));

  const catLookup = new Map(existingCats.map((c) => [c.name, c]));
  const neededCats = [...new Set(allGear.map((g) => g.categoryName))];

  for (const catName of neededCats) {
    if (!catLookup.has(catName)) {
      const color = CATEGORY_COLORS[catName] || "#6b7280";
      const sortOrder = Object.keys(CATEGORY_COLORS).indexOf(catName);

      if (!DRY_RUN) {
        const [created] = await db
          .insert(categories)
          .values({
            name: catName,
            color,
            sortOrder: sortOrder >= 0 ? sortOrder : 99,
            householdId: HOUSEHOLD_ID,
          })
          .returning();
        catLookup.set(catName, created);
        console.log(`Created category: ${catName} (${color})`);
      } else {
        console.log(`Would create category: ${catName} (${color})`);
        catLookup.set(catName, { id: `DRY-${catName}`, name: catName } as any);
      }
    }
  }

  // Check for existing items to avoid duplicates
  const existingItems = await db.select().from(items).where(eq(items.ownerId, thomas.id));
  const existingItemsByJen = await db.select().from(items).where(eq(items.ownerId, jennifer.id));
  const existingShared = await db
    .select()
    .from(items)
    .where(and(eq(items.ownerId, household.id), eq(items.ownerType, "shared")));

  const allExisting = [...existingItems, ...existingItemsByJen, ...existingShared];
  const existingNames = new Set(allExisting.map((i) => i.name.toLowerCase()));

  console.log(`\nExisting items in DB: ${allExisting.length}`);

  // Insert items
  let inserted = 0;
  let skipped = 0;

  const summary = { thomas: 0, jennifer: 0, birch: 0, shared: 0 };

  for (const gear of allGear) {
    if (existingNames.has(gear.name.toLowerCase())) {
      skipped++;
      continue;
    }

    const cat = catLookup.get(gear.categoryName);
    if (!cat) {
      console.warn(`  No category for "${gear.name}" — skipping`);
      skipped++;
      continue;
    }

    const ownerId = ownerIdMap[gear.ownerKey];
    if (!ownerId) {
      console.warn(`  No owner for "${gear.name}" (${gear.ownerKey}) — skipping`);
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      await db.insert(items).values({
        name: gear.name,
        brand: gear.brand,
        model: gear.model,
        weightGrams: gear.weightGrams,
        categoryId: cat.id,
        ownerType: gear.ownerType,
        ownerId,
        isWorn: gear.isWorn,
        isConsumable: gear.isConsumable,
      });
    }

    inserted++;
    summary[gear.ownerKey === "household" ? "shared" : gear.ownerKey]++;
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`${DRY_RUN ? "Would insert" : "Inserted"}: ${inserted} items`);
  console.log(`  Thomas: ${summary.thomas}`);
  console.log(`  Jennifer: ${summary.jennifer}`);
  console.log(`  Birch: ${summary.birch}`);
  console.log(`  Shared: ${summary.shared}`);
  console.log(`Skipped (duplicates/issues): ${skipped}`);
  console.log(`${"═".repeat(50)}\n`);

  if (DRY_RUN) {
    console.log("── Item Preview ──\n");
    const grouped = new Map<string, GearItem[]>();
    for (const g of allGear) {
      if (existingNames.has(g.name.toLowerCase())) continue;
      const key = `${g.ownerKey} / ${g.categoryName}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(g);
    }
    for (const [key, items] of [...grouped.entries()].sort()) {
      console.log(`\n${key}:`);
      for (const g of items) {
        const flags = [
          g.isWorn ? "worn" : null,
          g.isConsumable ? "consumable" : null,
          g.ownerType === "shared" ? "shared" : null,
        ]
          .filter(Boolean)
          .join(", ");
        const weight = `${(g.weightGrams / 28.3495).toFixed(1)} oz`;
        console.log(`  ${g.name} (${weight})${flags ? ` [${flags}]` : ""}`);
      }
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
