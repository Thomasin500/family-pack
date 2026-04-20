import type { TripStats, PackStats } from "@/lib/trip-stats";
import { displayWeight, type DisplayUnit } from "@/lib/weight";

export type InsightTone = "info" | "positive" | "warn" | "alert";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  detail?: string;
  /** Optional link-target pack for "scroll to" affordance from the stats panel. */
  packId?: string;
}

const MIN_HEAVIEST_PCT = 15; // single item ≥ 15% of base weight is worth calling out
const IMBALANCE_PCT = 65; // one person carrying ≥ 65% of shared gear triggers a nudge
const OVERLOADED_CARRY_PCT = 100; // getCarryWarning already handles, this hits literal overload

/**
 * Derive 3–5 actionable one-liners from a TripStats snapshot. No competitor
 * does this — every other app renders charts. These are the "so what" layer
 * on top of the same data. Keep the rules tight: only surface an insight if
 * it would actually change the user's behavior (move gear, swap an item,
 * rebalance). Ordered by tone (alert → warn → info → positive).
 */
export function computeTripInsights(stats: TripStats, unit: DisplayUnit): Insight[] {
  const insights: Insight[] = [];

  // 1. Heaviest single item per pack, when it dominates the pack.
  for (const pack of stats.packs) {
    if (!pack.heaviestItem || pack.baseGrams <= 0) continue;
    const pct = (pack.heaviestItem.grams / pack.baseGrams) * 100;
    if (pct >= MIN_HEAVIEST_PCT) {
      insights.push({
        id: `heaviest-${pack.packId}`,
        tone: "info",
        title: `${pack.heaviestItem.name} is ${Math.round(pct)}% of ${firstName(pack.name)}'s base weight`,
        detail: `${displayWeight(pack.heaviestItem.grams, unit)} of ${displayWeight(pack.baseGrams, unit)} base — the single heaviest pack item.`,
        packId: pack.packId,
      });
    }
  }

  // 2. Shared-gear imbalance — one person carrying too much of the household load.
  if (stats.sharedBalance.length > 1 && stats.sharedTotalGrams > 0) {
    const top = stats.sharedBalance[0];
    if (top.pct >= IMBALANCE_PCT) {
      const runnerUp = stats.sharedBalance[1];
      insights.push({
        id: `shared-imbalance-${top.packId}`,
        tone: "warn",
        title: `${firstName(top.name)} is carrying ${Math.round(top.pct)}% of shared gear`,
        detail:
          runnerUp && runnerUp.grams > 0
            ? `Moving an item or two to ${firstName(runnerUp.name)} would even things out.`
            : `Everyone else is carrying nothing shared — consider redistributing.`,
        packId: top.packId,
      });
    }
  }

  // 3. Overloaded or near-overloaded members (body-weight percent).
  for (const pack of stats.packs) {
    if (pack.bodyWeightPct === null) continue;
    if (pack.packClassKey === "overloaded") {
      insights.push({
        id: `overloaded-${pack.packId}`,
        tone: "alert",
        title: `${firstName(pack.name)} is overloaded (${pack.bodyWeightPct.toFixed(0)}% body weight)`,
        detail: `Consider shifting weight off this pack before the trail.`,
        packId: pack.packId,
      });
    }
  }
  // Safety rail: catches absurd overloads even if household thresholds are
  // set weirdly high and the class system didn't already flag it.
  for (const pack of stats.packs) {
    if (
      pack.bodyWeightPct !== null &&
      pack.bodyWeightPct >= OVERLOADED_CARRY_PCT &&
      pack.packClassKey !== "overloaded"
    ) {
      insights.push({
        id: `absurd-carry-${pack.packId}`,
        tone: "alert",
        title: `${firstName(pack.name)} is carrying ${pack.bodyWeightPct.toFixed(0)}% of their body weight`,
        detail: `Check that the body weight on file is current — or split the load.`,
        packId: pack.packId,
      });
    }
  }

  // 4. Empty pack with a member present (often a forgotten add).
  for (const pack of stats.packs) {
    if (pack.itemCount === 0) {
      insights.push({
        id: `empty-${pack.packId}`,
        tone: "warn",
        title: `${firstName(pack.name)}'s pack is empty`,
        detail: `Add gear from the closet or the Gear Pool to start planning this pack.`,
        packId: pack.packId,
      });
    }
  }

  // 5. Positive reinforcement — lightest pack class if no warnings for that pack.
  for (const pack of stats.packs) {
    if (pack.packClassKey === "ultralight" && pack.baseGrams > 0) {
      insights.push({
        id: `ultralight-${pack.packId}`,
        tone: "positive",
        title: `${firstName(pack.name)} is Ultralight (${displayWeight(pack.baseGrams, unit)} base)`,
        detail: `Base weight is below your household's ultralight threshold.`,
        packId: pack.packId,
      });
    }
  }

  return insights.sort(toneSortKey);
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] || name;
}

const TONE_ORDER: Record<InsightTone, number> = { alert: 0, warn: 1, info: 2, positive: 3 };
function toneSortKey(a: Insight, b: Insight): number {
  return TONE_ORDER[a.tone] - TONE_ORDER[b.tone];
}

/** Convenience helper for the first N insights (the stats panel shows 3–5). */
export function topInsights(stats: TripStats, unit: DisplayUnit, limit = 5): Insight[] {
  return computeTripInsights(stats, unit).slice(0, limit);
}

export function packStatsById(stats: TripStats, packId: string): PackStats | undefined {
  return stats.packs.find((p) => p.packId === packId);
}
