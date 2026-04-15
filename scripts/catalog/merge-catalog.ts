/**
 * Merge all extracted catalog sources into a single deduplicated catalog.
 * Reads: gear-weight-db.json, lighterpack-items.json, featherweight-items.json
 * Output: data/catalog/merged-catalog.json + data/catalog/merge-report.txt
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { dedupKey, type ExtractedItem } from "./brand-matcher";

const DATA_DIR = resolve(__dirname, "../../data/catalog");
const OUTPUT_PATH = resolve(DATA_DIR, "merged-catalog.json");
const REPORT_PATH = resolve(DATA_DIR, "merge-report.txt");

interface MergedItem {
  brand: string;
  model: string;
  categorySuggestion: string | null;
  sourceCount: number;
  sources: string[];
}

// Priority order for category resolution: GWDB > LP > FW > inferred
const SOURCE_PRIORITY = ["gear-weight-db", "lighterpack", "featherweight"];

function loadSource(filename: string): ExtractedItem[] {
  const path = resolve(DATA_DIR, filename);
  if (!existsSync(path)) {
    console.warn(`  Source not found: ${filename} — skipping`);
    return [];
  }
  const data = JSON.parse(readFileSync(path, "utf-8"));
  return data;
}

function main() {
  const report: string[] = [];
  report.push("=== Catalog Merge Report ===");
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push("");

  // Load all sources
  const gwdb = loadSource("gear-weight-db.json");
  const lp = loadSource("lighterpack-items.json");
  const fw = loadSource("featherweight-items.json");

  report.push(`Source counts:`);
  report.push(`  Gear Weight DB:   ${gwdb.length} items`);
  report.push(`  LighterPack:      ${lp.length} items`);
  report.push(`  Featherweight:    ${fw.length} items`);
  report.push("");

  // Also include the existing hand-curated seed as a source
  const existingSeedPath = resolve(__dirname, "../seed-catalog.ts");
  let existingSeedCount = 0;
  const existingSeedItems: ExtractedItem[] = [];
  if (existsSync(existingSeedPath)) {
    // Parse the hardcoded array from seed-catalog.ts
    const seedContent = readFileSync(existingSeedPath, "utf-8");
    const regex =
      /\{\s*brand:\s*"([^"]+)",\s*model:\s*"([^"]+)",\s*categorySuggestion:\s*"([^"]+)"\s*\}/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(seedContent)) !== null) {
      existingSeedItems.push({
        brand: m[1],
        model: m[2],
        categorySuggestion: m[3],
        sources: ["hand-curated"],
      });
    }
    existingSeedCount = existingSeedItems.length;
    report.push(`  Hand-curated seed: ${existingSeedCount} items`);
    report.push("");
  }

  // Merge everything
  const merged = new Map<string, MergedItem>();
  const allSources: [ExtractedItem[], string][] = [
    [existingSeedItems, "hand-curated"],
    [gwdb, "gear-weight-db"],
    [lp, "lighterpack"],
    [fw, "featherweight"],
  ];

  let dupeCount = 0;
  const suspicious: string[] = [];

  for (const [items, sourceName] of allSources) {
    for (const item of items) {
      const key = dedupKey(item.brand, item.model);

      if (merged.has(key)) {
        // Duplicate across sources — merge
        const existing = merged.get(key)!;
        if (!existing.sources.includes(sourceName)) {
          existing.sources.push(sourceName);
          existing.sourceCount++;
        }
        // Upgrade category if current source has higher priority
        if (
          item.categorySuggestion &&
          (!existing.categorySuggestion ||
            SOURCE_PRIORITY.indexOf(sourceName) < SOURCE_PRIORITY.indexOf(existing.sources[0]))
        ) {
          existing.categorySuggestion = item.categorySuggestion;
        }
        dupeCount++;
      } else {
        // New item
        // Flag suspicious entries
        if (item.model.length <= 1) {
          suspicious.push(`Too short: "${item.brand} ${item.model}" (${sourceName})`);
          continue;
        }
        // Skip purely numeric models UNLESS they're 3+ digits (product size numbers like "450", "650")
        if (/^\d{1,2}$/.test(item.model)) {
          suspicious.push(`Short numeric: "${item.brand} ${item.model}" (${sourceName})`);
          continue;
        }

        merged.set(key, {
          brand: item.brand,
          model: item.model,
          categorySuggestion: item.categorySuggestion ?? null,
          sourceCount: 1,
          sources: [sourceName],
        });
      }
    }
  }

  // Sort: high source count first, then alphabetical
  const output = Array.from(merged.values()).sort((a, b) => {
    if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
    return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
  });

  // Generate report
  report.push(`Merge results:`);
  report.push(`  Total unique items: ${output.length}`);
  report.push(`  Cross-source duplicates resolved: ${dupeCount}`);
  report.push(`  Suspicious entries skipped: ${suspicious.length}`);
  report.push("");

  // Source count distribution
  const countDist = new Map<number, number>();
  for (const item of output) {
    countDist.set(item.sourceCount, (countDist.get(item.sourceCount) ?? 0) + 1);
  }
  report.push(`Source count distribution:`);
  for (const [count, num] of Array.from(countDist.entries()).sort((a, b) => b[0] - a[0])) {
    report.push(`  ${count} sources: ${num} items`);
  }
  report.push("");

  // Category distribution
  const catDist = new Map<string, number>();
  for (const item of output) {
    const cat = item.categorySuggestion ?? "(uncategorized)";
    catDist.set(cat, (catDist.get(cat) ?? 0) + 1);
  }
  report.push(`Category distribution:`);
  for (const [cat, num] of Array.from(catDist.entries()).sort((a, b) => b[1] - a[1])) {
    report.push(`  ${cat}: ${num}`);
  }
  report.push("");

  // Top brands
  const brandDist = new Map<string, number>();
  for (const item of output) {
    brandDist.set(item.brand, (brandDist.get(item.brand) ?? 0) + 1);
  }
  report.push(`Top 20 brands:`);
  const topBrands = Array.from(brandDist.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  for (const [brand, num] of topBrands) {
    report.push(`  ${brand}: ${num}`);
  }
  report.push("");

  // High confidence items (3+ sources)
  const highConf = output.filter((i) => i.sourceCount >= 3);
  if (highConf.length > 0) {
    report.push(`High confidence items (3+ sources): ${highConf.length}`);
    for (const item of highConf.slice(0, 30)) {
      report.push(`  ${item.brand} ${item.model} [${item.sources.join(", ")}]`);
    }
    if (highConf.length > 30) report.push(`  ... and ${highConf.length - 30} more`);
    report.push("");
  }

  // Suspicious entries
  if (suspicious.length > 0) {
    report.push(`Suspicious entries (skipped):`);
    for (const s of suspicious.slice(0, 50)) {
      report.push(`  ${s}`);
    }
    if (suspicious.length > 50) report.push(`  ... and ${suspicious.length - 50} more`);
  }

  // Write outputs
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  writeFileSync(REPORT_PATH, report.join("\n"));

  console.log(report.join("\n"));
  console.log("");
  console.log(`Catalog: ${OUTPUT_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
