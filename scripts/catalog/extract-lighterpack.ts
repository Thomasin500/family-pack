/**
 * Extract catalog items from LighterPack list URLs.
 * Source: xlsx file with LighterPack URLs from r/Ultralight community.
 * Fetches each list's JSON, extracts item names, runs brand extraction.
 * Caches raw responses in data/catalog/cache/lp-{code}.json.
 * Output: data/catalog/lighterpack-items.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import {
  extractBrand,
  normalizeModel,
  inferCategory,
  dedupKey,
  type ExtractedItem,
} from "./brand-matcher";

const XLSX_PATH = resolve(process.env.HOME ?? "~", "Downloads/List of Gear Lists (Responses).xlsx");
const MANUAL_URLS_PATH = resolve(__dirname, "../../data/catalog/manual-lp-urls.txt");
const OUTPUT_PATH = resolve(__dirname, "../../data/catalog/lighterpack-items.json");
const CACHE_DIR = resolve(__dirname, "../../data/catalog/cache");
const DELAY_MS = 500; // Be polite to LighterPack servers

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchList(code: string): Promise<any[] | null> {
  const cachePath = resolve(CACHE_DIR, `lp-${code}.json`);

  // Check cache first
  if (existsSync(cachePath)) {
    try {
      const cached = JSON.parse(readFileSync(cachePath, "utf-8"));
      if (Array.isArray(cached)) return cached;
      if (cached.items) return cached.items;
    } catch {
      // Corrupted cache, re-fetch
    }
  }

  try {
    const url = `https://lighterpack.com/r/${code}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`  [${res.status}] ${code} — skipping`);
      return null;
    }

    const html = await res.text();

    // LighterPack renders items as HTML with class="lpName"
    const namePattern = /<span class="lpName"[^>]*>([^<]+)<\/span>/g;
    const items: any[] = [];
    let match;
    while ((match = namePattern.exec(html)) !== null) {
      const name = match[1]
        .trim()
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, "/");
      if (name) items.push({ name });
    }

    if (items.length === 0) {
      console.warn(`  [no items] ${code} — page had no parseable items`);
      return null;
    }

    writeFileSync(cachePath, JSON.stringify(items));
    return items;
  } catch (err: any) {
    console.warn(`  [error] ${code} — ${err.message}`);
    return null;
  }
}

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true });

  const codes = new Set<string>();

  // Source 1: xlsx file with URLs
  if (existsSync(XLSX_PATH)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require("xlsx");
    const wb = XLSX.readFile(XLSX_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    for (const row of rows) {
      for (const cell of Object.values(row)) {
        if (typeof cell === "string") {
          const matches = cell.match(/lighterpack\.com\/r\/([a-zA-Z0-9]+)/g);
          if (matches) {
            for (const m of matches) {
              codes.add(m.replace("lighterpack.com/r/", ""));
            }
          }
        }
      }
    }
    console.log(`From xlsx: ${codes.size} codes`);
  }

  // Source 2: manual URLs text file (one URL per line)
  if (existsSync(MANUAL_URLS_PATH)) {
    const manual = readFileSync(MANUAL_URLS_PATH, "utf-8");
    const urlMatches = manual.match(/lighterpack\.com\/r\/([a-zA-Z0-9]+)/g);
    if (urlMatches) {
      const before = codes.size;
      for (const m of urlMatches) {
        codes.add(m.replace("lighterpack.com/r/", ""));
      }
      console.log(`From manual URLs: ${codes.size - before} new codes`);
    }
  }

  if (codes.size === 0) {
    console.error(
      "No LighterPack URLs found. Add URLs to data/catalog/manual-lp-urls.txt or download the xlsx."
    );
    process.exit(1);
  }

  console.log(`Total: ${codes.size} unique LighterPack list codes`);

  // Fetch each list
  const allItems: Map<string, ExtractedItem> = new Map();
  const codeArr = Array.from(codes);
  let fetched = 0;
  let failed = 0;
  let totalItemsSeen = 0;

  for (let i = 0; i < codeArr.length; i++) {
    const code = codeArr[i];
    process.stdout.write(`\r  Fetching ${i + 1}/${codeArr.length}: ${code}...`);

    const items = await fetchList(code);
    if (!items) {
      failed++;
      await sleep(DELAY_MS);
      continue;
    }
    fetched++;

    for (const item of items) {
      const name = (item.name ?? item.title ?? "").toString().trim();
      if (!name || name.length < 3) continue;
      totalItemsSeen++;

      const extracted = extractBrand(name);
      if (!extracted) continue;

      const model = normalizeModel(extracted.model);
      if (!model || model.length < 2) continue;

      const key = dedupKey(extracted.brand, model);
      if (!allItems.has(key)) {
        allItems.set(key, {
          brand: extracted.brand,
          model,
          categorySuggestion:
            inferCategory(`${extracted.brand} ${model}`) ??
            item.category ??
            item.categoryName ??
            undefined,
          sources: ["lighterpack"],
        });
      }
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nFetched ${fetched} lists, ${failed} failed`);
  console.log(`Saw ${totalItemsSeen} total items → ${allItems.size} unique brand+model`);

  const output = Array.from(allItems.values()).sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Extract failed:", err);
  process.exit(1);
});
