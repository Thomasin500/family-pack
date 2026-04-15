/**
 * Extract catalog items from the Crowd-Sourced Gear Weight Database xlsx.
 * Source: Google Forms responses with Company, Full name of gear, Category columns.
 * Output: data/catalog/gear-weight-db.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  normalizeBrand,
  normalizeModel,
  inferCategory,
  dedupKey,
  type ExtractedItem,
} from "./brand-matcher";

const XLSX_PATH = resolve(
  process.env.HOME ?? "~",
  "Downloads/Crowd-Sourced Gear Weight Database (Responses).xlsx"
);
const OUTPUT_PATH = resolve(__dirname, "../../data/catalog/gear-weight-db.json");

// Category mapping from their categories to ours
const CATEGORY_MAP: Record<string, string> = {
  Backpacks: "Big Four",
  Clothing: "Clothing",
  Electronics: "Electronics",
  "Hard Goods (stakes, trowels, poles, etc)": "Tools & Utility",
  "Headlamps / Flashlights": "Tools & Utility",
  Other: "",
  "Quilts / Sleeping Bags": "Sleep",
  Shelters: "Shelter",
  "Sleeping Pads": "Sleep",
  Stoves: "Kitchen & Food",
  "Water Treatment": "Water",
};

async function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`File not found: ${XLSX_PATH}`);
    console.error("Download the Crowd-Sourced Gear Weight Database xlsx to ~/Downloads/");
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx");
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

  const items = new Map<string, ExtractedItem>();
  let skipped = 0;

  for (const row of rows) {
    const rawBrand = (row["Company: "] ?? row["Company"] ?? "").toString().trim();
    const rawModel = (row["Full name of gear: "] ?? row["Full name of gear"] ?? "")
      .toString()
      .trim();
    const rawCategory = (
      row["Please select the category that the gear you are entering best falls into: "] ?? ""
    )
      .toString()
      .trim();

    if (!rawBrand || !rawModel) {
      skipped++;
      continue;
    }

    const brand = normalizeBrand(rawBrand);
    const model = normalizeModel(rawModel);
    const category = CATEGORY_MAP[rawCategory] || inferCategory(`${brand} ${model}`) || undefined;
    const key = dedupKey(brand, model);

    if (!items.has(key)) {
      items.set(key, {
        brand,
        model,
        categorySuggestion: category,
        sources: ["gear-weight-db"],
      });
    }
  }

  const output = Array.from(items.values()).sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(
    `Gear Weight DB: ${rows.length} rows → ${output.length} unique items (${skipped} skipped)`
  );
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Extract failed:", err);
  process.exit(1);
});
