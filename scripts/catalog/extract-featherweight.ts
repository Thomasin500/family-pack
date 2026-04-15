/**
 * Extract catalog items from the Featherweight ul_items.txt dataset.
 * Source: https://raw.githubusercontent.com/MooseV2/featherweight/master/docs/assets/ul_items.txt
 * Format: weight_in_milligrams,item_name (no header)
 * Output: data/catalog/featherweight-items.json
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  extractBrand,
  normalizeModel,
  inferCategory,
  dedupKey,
  type ExtractedItem,
} from "./brand-matcher";

const SOURCE_URL =
  "https://raw.githubusercontent.com/MooseV2/featherweight/master/docs/assets/ul_items.txt";
const CACHE_PATH = resolve(__dirname, "../../data/catalog/cache/featherweight-raw.txt");
const OUTPUT_PATH = resolve(__dirname, "../../data/catalog/featherweight-items.json");

async function fetchData(): Promise<string> {
  // Check cache
  if (existsSync(CACHE_PATH)) {
    console.log("Using cached featherweight data");
    return readFileSync(CACHE_PATH, "utf-8");
  }

  console.log(`Fetching ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  writeFileSync(CACHE_PATH, text);
  console.log(`Cached ${text.length} bytes`);
  return text;
}

async function main() {
  const raw = await fetchData();
  const lines = raw.split("\n").filter((l) => l.trim());

  console.log(`Total lines: ${lines.length}`);

  const items = new Map<string, ExtractedItem>();
  let noMatch = 0;
  let tooShort = 0;

  for (const line of lines) {
    // Format: weight,item_name
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) continue;

    const itemName = line.slice(commaIdx + 1).trim();
    if (!itemName || itemName.length < 3) {
      tooShort++;
      continue;
    }

    const extracted = extractBrand(itemName);
    if (!extracted) {
      noMatch++;
      continue;
    }

    const model = normalizeModel(extracted.model);
    if (!model || model.length < 2) {
      tooShort++;
      continue;
    }

    const key = dedupKey(extracted.brand, model);
    if (!items.has(key)) {
      items.set(key, {
        brand: extracted.brand,
        model,
        categorySuggestion: inferCategory(`${extracted.brand} ${model}`),
        sources: ["featherweight"],
      });
    }
  }

  console.log(`Processed: ${lines.length} lines`);
  console.log(`No brand match: ${noMatch}`);
  console.log(`Too short: ${tooShort}`);
  console.log(`Unique brand+model: ${items.size}`);

  const output = Array.from(items.values()).sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Extract failed:", err);
  process.exit(1);
});
