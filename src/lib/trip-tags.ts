import type { TripStats } from "@/lib/trip-stats";
import type { Trip } from "@/types";
import { lbToGrams } from "@/lib/weight";

export interface TripTag {
  id: string;
  label: string;
  /** Tailwind classes — use tokenized color vars so both themes look right. */
  tone: "primary" | "cool" | "warm" | "muted" | "alert";
  description?: string;
}

const WARM_ITEM_KEYWORDS = [
  "puffy",
  "down jacket",
  "insulated jacket",
  "parka",
  "mid layer",
  "fleece",
];
const COLD_GEAR_KEYWORDS = [
  "baselayer",
  "base layer",
  "merino",
  "beanie",
  "balaclava",
  "gloves",
  "mittens",
  "microspike",
  "traction",
  "gaiter",
];
const RAIN_KEYWORDS = ["rain jacket", "rain shell", "rain pant", "poncho"];
const BEAR_KEYWORDS = ["bear can", "bearvault", "bear bag", "ursack", "bear spray"];
const FISHING_KEYWORDS = ["rod", "reel", "tippet", "fly box", "waders", "lure", "tenkara"];
const DOG_KEYWORDS = ["dog food", "kibble", "dog bowl", "leash", "harness"];
const FIRE_KEYWORDS = ["lighter", "matches", "firestarter", "fire starter", "stove fuel"];

const DAYS_MULTI = 3; // 3+ nights → Multi-Day
const ULTRALIGHT_LB = 10;
const LIGHTWEIGHT_LB = 15;

function hasKeyword(haystack: string, keywords: string[]): boolean {
  return keywords.some((k) => haystack.includes(k));
}

function itemTextCorpus(trip: Trip | null | undefined): string {
  const out: string[] = [];
  for (const pack of trip?.packs ?? []) {
    for (const pi of pack.packItems ?? []) {
      const item = pi.item;
      if (!item) continue;
      out.push(item.name.toLowerCase());
      if (item.brand) out.push(item.brand.toLowerCase());
      if (item.model) out.push(item.model.toLowerCase());
      if (item.category?.name) out.push(item.category.name.toLowerCase());
      if (Array.isArray(item.tags)) out.push(...item.tags.map((t) => t.toLowerCase()));
    }
  }
  return out.join(" | ");
}

function tripDurationDays(trip: Trip | null | undefined): number | null {
  // Explicit duration (from the trip metadata form) wins over computed dates.
  if (trip?.durationDays && trip.durationDays > 0) return trip.durationDays;
  const start = trip?.startDate;
  const end = trip?.endDate;
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Auto-derive trip tags from pack contents, members, and trip metadata. No
 * manual tagging. Rules are intentionally conservative — we only show a tag
 * if it would feel true to the planner. Users can always ignore them.
 */
export function computeTripTags(trip: Trip | null | undefined, stats: TripStats): TripTag[] {
  const tags: TripTag[] = [];
  const corpus = itemTextCorpus(trip);

  // Pack weight class (household min — the lightest adult pack)
  const adultPacks = stats.packs.filter((p) => p.role !== "pet");
  if (adultPacks.length > 0) {
    const lightestBase = Math.min(...adultPacks.map((p) => p.baseGrams));
    if (lightestBase > 0 && lightestBase < lbToGrams(ULTRALIGHT_LB)) {
      tags.push({
        id: "ultralight",
        label: "Ultralight",
        tone: "primary",
        description: `Lightest adult base weight under ${ULTRALIGHT_LB} lb.`,
      });
    } else if (lightestBase > 0 && lightestBase < lbToGrams(LIGHTWEIGHT_LB)) {
      tags.push({
        id: "lightweight",
        label: "Lightweight",
        tone: "primary",
        description: `Lightest adult base weight under ${LIGHTWEIGHT_LB} lb.`,
      });
    }
  }

  // Duration
  const days = tripDurationDays(trip);
  if (days !== null && days >= DAYS_MULTI) {
    tags.push({
      id: "multi-day",
      label: `${days}-Day`,
      tone: "muted",
      description: `Trip spans ${days} days.`,
    });
  }

  // Cold / warm gear signals
  if (hasKeyword(corpus, WARM_ITEM_KEYWORDS)) {
    tags.push({
      id: "warm-rated",
      label: "Warm Rated",
      tone: "warm",
      description: "Insulation layers packed.",
    });
  }
  if (hasKeyword(corpus, COLD_GEAR_KEYWORDS)) {
    tags.push({
      id: "cold-weather",
      label: "Cold Weather",
      tone: "cool",
      description: "Base layers or cold-weather accessories packed.",
    });
  }

  // Rain / wet conditions
  if (hasKeyword(corpus, RAIN_KEYWORDS)) {
    tags.push({
      id: "rain-ready",
      label: "Rain Ready",
      tone: "cool",
      description: "Rain shell or rain pants packed.",
    });
  }

  // Bear country
  if (hasKeyword(corpus, BEAR_KEYWORDS)) {
    tags.push({
      id: "bear-safe",
      label: "Bear Safe",
      tone: "warm",
      description: "Bear canister, Ursack, or bear spray packed.",
    });
  }

  // Activity: fishing
  if (hasKeyword(corpus, FISHING_KEYWORDS)) {
    tags.push({
      id: "fishing",
      label: "Fishing",
      tone: "cool",
      description: "Fishing gear packed.",
    });
  }

  // Dog-friendly: any pet member on the trip
  const hasPet = stats.packs.some((p) => p.role === "pet");
  if (hasPet || hasKeyword(corpus, DOG_KEYWORDS)) {
    tags.push({
      id: "dog-friendly",
      label: "Dog Friendly",
      tone: "primary",
      description: "A pet is on this trip.",
    });
  }

  // Fire: has an ignition source
  if (hasKeyword(corpus, FIRE_KEYWORDS)) {
    tags.push({
      id: "fire-ready",
      label: "Fire Ready",
      tone: "warm",
      description: "Fire starter or fuel packed.",
    });
  }

  // Minimalist: ≤ 10 total items across all packs
  const totalItems = stats.packs.reduce((s, p) => s + p.itemCount, 0);
  if (totalItems > 0 && totalItems <= 10) {
    tags.push({
      id: "minimalist",
      label: "Minimalist",
      tone: "muted",
      description: "Fewer than 10 items across the whole trip.",
    });
  }

  return tags;
}

/** Tailwind token map for consistent rendering. */
export function tagToneClasses(tone: TripTag["tone"]): string {
  switch (tone) {
    case "primary":
      return "bg-primary/15 text-primary";
    case "cool":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
    case "warm":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    case "alert":
      return "bg-red-500/15 text-red-600 dark:text-red-400";
    case "muted":
    default:
      return "bg-surface-low text-outline";
  }
}
