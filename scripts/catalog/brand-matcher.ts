import { readFileSync } from "fs";
import { resolve } from "path";

interface BrandEntry {
  canonical: string;
  aliases: string[];
}

interface BrandsConfig {
  brands: BrandEntry[];
  categoryKeywords: Record<string, string[]>;
}

let _config: BrandsConfig | null = null;
let _lookupMap: Map<string, string> | null = null;
let _sortedKeys: string[] | null = null;

function getConfig(): BrandsConfig {
  if (!_config) {
    const raw = readFileSync(resolve(__dirname, "../../data/catalog/known-brands.json"), "utf-8");
    _config = JSON.parse(raw);
  }
  return _config!;
}

function getLookupMap(): Map<string, string> {
  if (!_lookupMap) {
    const config = getConfig();
    _lookupMap = new Map<string, string>();
    for (const brand of config.brands) {
      _lookupMap.set(brand.canonical.toLowerCase(), brand.canonical);
      for (const alias of brand.aliases) {
        _lookupMap.set(alias.toLowerCase(), brand.canonical);
      }
    }
  }
  return _lookupMap;
}

function getSortedKeys(): string[] {
  if (!_sortedKeys) {
    // Sort by length descending so "Sea to Summit" matches before "Sea"
    _sortedKeys = Array.from(getLookupMap().keys()).sort((a, b) => b.length - a.length);
  }
  return _sortedKeys;
}

export interface ExtractedItem {
  brand: string;
  model: string;
  categorySuggestion?: string;
  sources: string[];
}

/**
 * Extract brand from a freetext item name.
 * Returns { brand, model } or null if no brand matched.
 */
export function extractBrand(itemName: string): { brand: string; model: string } | null {
  const nameLower = itemName.toLowerCase().trim();
  if (!nameLower) return null;

  for (const key of getSortedKeys()) {
    if (nameLower.startsWith(key)) {
      const rest = itemName.slice(key.length).trim();
      // Model must be at least 1 char
      if (rest.length < 1) continue;
      // Must start with a word boundary (space, hyphen, or the key matches exactly)
      const charAfterBrand = itemName.charAt(key.length);
      if (charAfterBrand && !/[\s\-_/]/.test(charAfterBrand)) continue;

      const brand = getLookupMap().get(key)!;
      const model = rest.replace(/^[\s\-_/]+/, "").trim();
      if (!model) continue;
      return { brand, model };
    }
  }
  return null;
}

/**
 * Normalize brand name: match against known brands.
 * Returns canonical brand name or the input trimmed.
 */
export function normalizeBrand(brand: string): string {
  const lookup = getLookupMap();
  const canonical = lookup.get(brand.toLowerCase().trim());
  return canonical ?? brand.trim();
}

/**
 * Infer a category from an item name or model using keyword matching.
 */
export function inferCategory(text: string): string | undefined {
  const config = getConfig();
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(config.categoryKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return undefined;
}

/**
 * Normalize a model name: trim, collapse whitespace, strip common junk suffixes.
 */
export function normalizeModel(model: string): string {
  return (
    model
      .trim()
      // Collapse whitespace
      .replace(/\s+/g, " ")
      // Strip trailing parenthetical notes like "(2023)" or "(large)"
      .replace(/\s*\([^)]*\)\s*$/, "")
      // Strip trailing size like "- Large" or "/ M"
      .replace(/\s*[-\/]\s*(xs|s|m|l|xl|xxl|small|medium|large|x-large|one size)\s*$/i, "")
      .trim()
  );
}

/**
 * Create a dedup key for a brand+model pair.
 */
export function dedupKey(brand: string, model: string): string {
  return `${brand.toLowerCase()}|${normalizeModel(model).toLowerCase()}`;
}
