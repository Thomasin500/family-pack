"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { displayWeight, displayTotalWeight } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { useHousehold } from "@/hooks/use-household";
import { computeTripStats, type PackStats, type TripStats } from "@/lib/trip-stats";
import { computeTripInsights, type Insight } from "@/lib/trip-insights";
import { computeTripTags, tagToneClasses, type TripTag } from "@/lib/trip-tags";
import type { Trip } from "@/types";

type ChartMode = "bar" | "pie";
const CHART_MODE_KEY = "family-pack:stats-chart-mode";

interface TripStatsPanelProps {
  trip: Trip;
}

/**
 * Collapsible trip stats drawer that lives inside the workspace. Contains
 * Insights (the wedge — nobody else does this), smart auto-derived tags,
 * per-pack stacked breakdown, category bars, and shared-weight balance.
 * All computation happens in pure lib modules so this component can stay
 * presentational.
 */
export function TripStatsPanel({ trip }: TripStatsPanelProps) {
  const [open, setOpen] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [hydratedMode, setHydratedMode] = useState(false);
  const { unit } = useWeightUnit();
  const { data: householdData } = useHousehold();
  const settings = householdData?.household?.settings;

  // We read localStorage on first open (not in useEffect — the ESLint config
  // blocks setState-in-effect, and there's no good reason to hydrate this
  // before the user has engaged with the panel anyway). Charts aren't visible
  // until open.
  function handleToggleOpen() {
    if (!open && !hydratedMode && typeof window !== "undefined") {
      const saved = window.localStorage.getItem(CHART_MODE_KEY);
      if (saved === "pie") setChartMode("pie");
      setHydratedMode(true);
    }
    setOpen((o) => !o);
  }

  function handleChartMode(mode: ChartMode) {
    setChartMode(mode);
    setHydratedMode(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHART_MODE_KEY, mode);
    }
  }

  const stats = useMemo(() => computeTripStats(trip, settings), [trip, settings]);
  const insights = useMemo(() => computeTripInsights(stats, unit), [stats, unit]);
  const tags = useMemo(() => computeTripTags(trip, stats), [trip, stats]);

  const totalItems = stats.packs.reduce((s, p) => s + p.itemCount, 0);
  const hasData = totalItems > 0;

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-card overflow-hidden">
      <button
        type="button"
        onClick={handleToggleOpen}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-high transition-colors cursor-pointer select-none text-sm"
        aria-expanded={open}
        aria-controls="trip-stats-body"
      >
        {/* Chevron on the left to match Gear Pool + closet categories + pack columns. */}
        <span className="text-outline">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
        <BarChart3 className="size-4 text-outline" />
        <span className="font-bold">Trip Stats</span>
        {hasData && (
          <span className="text-outline">
            {insights.length > 0 && (
              <>
                <InsightBadgeRow insights={insights} />
                {" · "}
              </>
            )}
            {tags.length} {tags.length === 1 ? "tag" : "tags"} · {stats.packs.length}{" "}
            {stats.packs.length === 1 ? "pack" : "packs"} ·{" "}
            <span className="font-mono tabular-nums">
              {displayTotalWeight(stats.householdCarriedGrams)}
            </span>{" "}
            total
          </span>
        )}
      </button>
      {open && (
        <div id="trip-stats-body" className="border-t border-outline-variant/10 p-4 space-y-6">
          {!hasData ? (
            <p className="text-sm text-outline italic py-4 text-center">
              Add gear to any pack to see insights, tags, and charts here.
            </p>
          ) : (
            <>
              {tags.length > 0 && <TagsRow tags={tags} />}
              {insights.length > 0 && <InsightsList insights={insights} />}
              <HouseholdTotalsRow stats={stats} />
              <BaseConsumableStackedBar stats={stats} unit={unit} />
              {stats.sharedTotalGrams > 0 && <SharedBalanceViz stats={stats} />}
              <CategoryChartGrid
                stats={stats}
                unit={unit}
                chartMode={chartMode}
                onChartMode={handleChartMode}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}

// ── Tags row ─────────────────────────────────────────────────────────────────

function TagsRow({ tags }: { tags: TripTag[] }) {
  return (
    <div>
      <SectionHeader title="Trip Tags" hint="Auto-derived from pack contents" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t.id}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tagToneClasses(t.tone)}`}
            title={t.description}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Insights ─────────────────────────────────────────────────────────────────

function InsightBadgeRow({ insights }: { insights: Insight[] }) {
  const alerts = insights.filter((i) => i.tone === "alert").length;
  const warns = insights.filter((i) => i.tone === "warn").length;
  const info = insights.length - alerts - warns;
  if (insights.length === 0) return null;
  return (
    <span>
      {alerts > 0 && (
        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertTriangle className="size-3" />
          {alerts}
        </span>
      )}
      {warns > 0 && (
        <span className="ml-2 inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <AlertCircle className="size-3" />
          {warns}
        </span>
      )}
      {alerts === 0 && warns === 0 && info > 0 && (
        <span className="inline-flex items-center gap-1">
          <Info className="size-3" />
          {info}
        </span>
      )}
    </span>
  );
}

function InsightsList({ insights }: { insights: Insight[] }) {
  return (
    <div>
      <SectionHeader title="Insights" hint="Actionable highlights" />
      <ul className="space-y-2">
        {insights.slice(0, 5).map((i) => (
          <InsightRow key={i.id} insight={i} />
        ))}
      </ul>
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const tone =
    insight.tone === "alert"
      ? "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
      : insight.tone === "warn"
        ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30"
        : insight.tone === "positive"
          ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
          : "bg-surface-low text-foreground border-outline-variant/20";

  const Icon =
    insight.tone === "alert"
      ? AlertTriangle
      : insight.tone === "warn"
        ? AlertCircle
        : insight.tone === "positive"
          ? CheckCircle2
          : Info;

  function onClick() {
    if (!insight.packId) return;
    const el = document.querySelector(`[data-pack-id="${insight.packId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={!insight.packId}
        className={`w-full text-left flex items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${tone} ${insight.packId ? "hover:brightness-105 cursor-pointer" : "cursor-default"}`}
      >
        <Icon className="size-4 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{insight.title}</div>
          {insight.detail && <div className="text-xs opacity-80 mt-0.5">{insight.detail}</div>}
        </div>
      </button>
    </li>
  );
}

// ── Household totals ─────────────────────────────────────────────────────────

function HouseholdTotalsRow({ stats }: { stats: TripStats }) {
  const metrics = [
    { label: "Base", grams: stats.householdBaseGrams },
    { label: "Total Carried", grams: stats.householdCarriedGrams },
    { label: "Skin-Out", grams: stats.householdSkinOutGrams },
    { label: "Shared", grams: stats.sharedTotalGrams },
  ];
  return (
    <div>
      <SectionHeader title="Household Totals" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-surface-low p-3">
            <div className="text-[10px] font-bold uppercase text-outline">{m.label}</div>
            <div className="text-base font-extrabold tabular-nums">
              {displayTotalWeight(m.grams)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Base / Consumable / Worn stacked bar ──────────────────────────────────────

function BaseConsumableStackedBar({
  stats,
  unit,
}: {
  stats: TripStats;
  unit: ReturnType<typeof useWeightUnit>["unit"];
}) {
  const maxGrams = Math.max(
    1,
    ...stats.packs.map((p) => p.baseGrams + p.consumableGrams + p.wornGrams)
  );
  return (
    <div>
      <SectionHeader
        title="Base · Consumable · Worn per Pack"
        hint="How each person's total breaks down"
      />
      <div className="space-y-2">
        {stats.packs.map((pack) => (
          <StackedPackBar key={pack.packId} pack={pack} maxGrams={maxGrams} unit={unit} />
        ))}
      </div>
      <Legend
        items={[
          { label: "Base", color: "bg-primary" },
          { label: "Consumable", color: "bg-primary-container" },
          { label: "Worn", color: "bg-outline/40" },
        ]}
      />
    </div>
  );
}

function StackedPackBar({
  pack,
  maxGrams,
  unit,
}: {
  pack: PackStats;
  maxGrams: number;
  unit: ReturnType<typeof useWeightUnit>["unit"];
}) {
  const total = pack.baseGrams + pack.consumableGrams + pack.wornGrams;
  if (total === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 shrink-0 text-xs font-bold truncate">{pack.name}</div>
        <div className="flex-1 h-3 rounded-full bg-surface-low" />
        <span className="w-20 shrink-0 text-right text-[11px] text-outline tabular-nums">—</span>
      </div>
    );
  }
  const scale = total / maxGrams;
  const basePct = (pack.baseGrams / total) * 100 * scale;
  const consumablePct = (pack.consumableGrams / total) * 100 * scale;
  const wornPct = (pack.wornGrams / total) * 100 * scale;
  return (
    <div
      className="flex items-center gap-3"
      title={`Base: ${displayWeight(pack.baseGrams, unit)} · Consumable: ${displayWeight(pack.consumableGrams, unit)} · Worn: ${displayWeight(pack.wornGrams, unit)}`}
    >
      <div className="w-24 shrink-0 text-xs font-bold truncate">
        {pack.role === "pet" ? "🐾 " : ""}
        {firstName(pack.name)}
      </div>
      <div className="flex-1 h-3 rounded-full bg-surface-low overflow-hidden flex">
        <div className="bg-primary" style={{ width: `${basePct}%` }} aria-label="Base" />
        <div
          className="bg-primary-container"
          style={{ width: `${consumablePct}%` }}
          aria-label="Consumable"
        />
        <div className="bg-outline/40" style={{ width: `${wornPct}%` }} aria-label="Worn" />
      </div>
      <span className="w-20 shrink-0 text-right text-[11px] font-mono tabular-nums text-outline">
        {displayTotalWeight(total)}
      </span>
    </div>
  );
}

// ── Shared balance viz ────────────────────────────────────────────────────────

function SharedBalanceViz({ stats }: { stats: TripStats }) {
  const top = stats.sharedBalance[0];
  const smartSummary = (() => {
    if (stats.sharedBalance.length === 0) return null;
    if (stats.sharedBalance.length === 1) {
      return `${firstName(top.name)} is carrying all shared gear (${displayTotalWeight(top.grams)}).`;
    }
    return `${firstName(top.name)} is carrying ${Math.round(top.pct)}% of shared gear.`;
  })();

  return (
    <div>
      <SectionHeader
        title="Shared Gear Balance"
        hint="Who's carrying the household's shared items"
      />
      <div className="flex h-4 rounded-full overflow-hidden bg-surface-low mb-2">
        {stats.sharedBalance.map((entry, i) => (
          <div
            key={entry.packId}
            className={i === 0 ? "bg-primary" : i === 1 ? "bg-primary-container" : "bg-outline/40"}
            style={{ width: `${entry.pct}%` }}
            title={`${entry.name}: ${displayTotalWeight(entry.grams)} (${entry.pct.toFixed(0)}%)`}
            aria-label={`${entry.name}: ${entry.pct.toFixed(0)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-outline">
        {stats.sharedBalance.map((entry, i) => (
          <div key={entry.packId} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 rounded-full ${
                i === 0 ? "bg-primary" : i === 1 ? "bg-primary-container" : "bg-outline/40"
              }`}
            />
            <span className="font-bold text-foreground">{firstName(entry.name)}</span>
            <span className="tabular-nums">
              {entry.pct.toFixed(0)}% · {displayTotalWeight(entry.grams)}
            </span>
          </div>
        ))}
      </div>
      {smartSummary && <p className="mt-2 text-xs text-outline italic">{smartSummary}</p>}
    </div>
  );
}

// ── Category breakdown bar chart ──────────────────────────────────────────────

function CategoryChartGrid({
  stats,
  unit,
  chartMode,
  onChartMode,
}: {
  stats: TripStats;
  unit: ReturnType<typeof useWeightUnit>["unit"];
  chartMode: ChartMode;
  onChartMode: (m: ChartMode) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
          Category Weight per Pack
        </h3>
        <ChartModeToggle mode={chartMode} onChange={onChartMode} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.packs.map((pack) =>
          chartMode === "pie" ? (
            <CategoryPie key={pack.packId} pack={pack} unit={unit} />
          ) : (
            <CategoryBars key={pack.packId} pack={pack} unit={unit} />
          )
        )}
      </div>
    </div>
  );
}

function ChartModeToggle({
  mode,
  onChange,
}: {
  mode: ChartMode;
  onChange: (m: ChartMode) => void;
}) {
  const base =
    "flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors";
  return (
    <div
      className="inline-flex rounded-md border border-outline-variant/20 overflow-hidden"
      role="group"
      aria-label="Chart style"
    >
      <button
        type="button"
        className={`${base} ${mode === "bar" ? "bg-primary/15 text-primary" : "text-outline hover:text-foreground"}`}
        onClick={() => onChange("bar")}
        aria-pressed={mode === "bar"}
      >
        <BarChart2 className="size-3" />
        Bar
      </button>
      <button
        type="button"
        className={`${base} ${mode === "pie" ? "bg-primary/15 text-primary" : "text-outline hover:text-foreground"}`}
        onClick={() => onChange("pie")}
        aria-pressed={mode === "pie"}
      >
        <PieIcon className="size-3" />
        Pie
      </button>
    </div>
  );
}

function CategoryPie({
  pack,
  unit,
}: {
  pack: PackStats;
  unit: ReturnType<typeof useWeightUnit>["unit"];
}) {
  const total = pack.categories.reduce((s, c) => s + c.grams, 0);
  if (pack.categories.length === 0 || total === 0) {
    return (
      <div className="rounded-md border border-outline-variant/10 p-3">
        <div className="text-xs font-bold mb-1">
          {pack.role === "pet" ? "🐾 " : ""}
          {firstName(pack.name)}
        </div>
        <div className="text-xs text-outline italic">No items packed.</div>
      </div>
    );
  }

  // Recharts likes a {name, value, color} shape.
  const data = pack.categories.map((c) => ({
    name: c.name,
    value: c.grams,
    color: c.color,
  }));

  return (
    <div className="rounded-md border border-outline-variant/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold">
          {pack.role === "pet" ? "🐾 " : ""}
          {firstName(pack.name)}
        </div>
        <div className="text-[11px] text-outline font-mono tabular-nums">
          {displayWeight(total, unit)}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="95%"
                paddingAngle={1.5}
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry, i) => (
                  <Cell key={`c-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value, name) => {
                  const v = typeof value === "number" ? value : Number(value) || 0;
                  return [
                    `${displayWeight(v, unit)} (${Math.round((v / total) * 100)}%)`,
                    String(name ?? ""),
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 min-w-[110px]">
          {pack.categories.slice(0, 6).map((cat) => {
            const pct = Math.round((cat.grams / total) * 100);
            return (
              <div
                key={cat.categoryId ?? `u-${cat.name}`}
                className="flex items-center gap-1.5 text-[10px] leading-tight"
                title={`${displayWeight(cat.grams, unit)} · ${pct}%`}
              >
                <span
                  className="inline-block size-2 rounded-sm shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="tabular-nums text-outline font-mono">{pct}%</span>
              </div>
            );
          })}
          {pack.categories.length > 6 && (
            <div className="text-[10px] text-outline italic">
              +{pack.categories.length - 6} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBars({
  pack,
  unit,
}: {
  pack: PackStats;
  unit: ReturnType<typeof useWeightUnit>["unit"];
}) {
  const total = pack.categories.reduce((s, c) => s + c.grams, 0);
  const maxGrams = Math.max(1, ...pack.categories.map((c) => c.grams));
  if (pack.categories.length === 0) {
    return (
      <div className="rounded-md border border-outline-variant/10 p-3">
        <div className="text-xs font-bold mb-1">
          {pack.role === "pet" ? "🐾 " : ""}
          {firstName(pack.name)}
        </div>
        <div className="text-xs text-outline italic">No items packed.</div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-outline-variant/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold">
          {pack.role === "pet" ? "🐾 " : ""}
          {firstName(pack.name)}
        </div>
        <div className="text-[11px] text-outline font-mono tabular-nums">
          {displayWeight(total, unit)}
        </div>
      </div>
      <div className="space-y-1.5">
        {pack.categories.map((cat) => {
          const pct = (cat.grams / maxGrams) * 100;
          return (
            <div
              key={cat.categoryId ?? `__uncat-${cat.name}`}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className="w-20 shrink-0 truncate">{cat.name}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-low overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: cat.color,
                  }}
                />
              </div>
              <span className="w-14 text-right font-mono tabular-nums text-outline">
                {displayWeight(cat.grams, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── shared bits ───────────────────────────────────────────────────────────────

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-outline">{title}</h3>
      {hint && <span className="text-[10px] text-outline/70">{hint}</span>}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-outline">
      {items.map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <span className={`inline-block size-2 rounded-full ${l.color}`} />
          <span>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] || name;
}
