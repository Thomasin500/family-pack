"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTrips } from "@/hooks/use-trips";
import { useHousehold } from "@/hooks/use-household";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { computeTripStats } from "@/lib/trip-stats";
import { gramsToLb } from "@/lib/weight";
import { TrendingDown, Calendar, Mountain } from "lucide-react";
import type { Trip, User } from "@/types";

interface TrendPoint {
  tripId: string;
  tripName: string;
  date: string;
  iso: number; // ms timestamp for sorting
  [userName: string]: string | number;
}

/**
 * Base-weight-over-time for every adult in the household across all trips.
 * No competitor offers this kind of trend visibility — it's unique to the
 * household model because we can associate a pack with a person over time.
 * Renders nothing until there are ≥ 2 trips with enough data.
 */
export function BaseWeightTrend() {
  const { data: trips, isLoading } = useTrips();
  const { data: householdData } = useHousehold();
  const { unit } = useWeightUnit();
  const [showAll, setShowAll] = useState(false);

  const settings = householdData?.household?.settings;
  const allMembers = (householdData?.members ?? []) as User[];
  const adults = allMembers.filter((m) => m.role !== "pet");

  const chartUnitLabel = unit === "kg" || unit === "g" ? "kg" : "lb";

  const points = useMemo<TrendPoint[]>(() => {
    if (!trips) return [];
    const toChartValue = (grams: number) =>
      unit === "kg" || unit === "g" ? +(grams / 1000).toFixed(2) : +gramsToLb(grams).toFixed(2);
    const tripsWithDate = (trips as Trip[])
      .filter((t) => t.startDate && (t.packs ?? []).some((p) => (p.packItems ?? []).length > 0))
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
      });

    return tripsWithDate.map((trip) => {
      const stats = computeTripStats(trip, settings);
      const iso = trip.startDate ? new Date(trip.startDate).getTime() : 0;
      const row: TrendPoint = {
        tripId: trip.id,
        tripName: trip.name,
        date: formatShort(trip.startDate),
        iso,
      };
      for (const pack of stats.packs) {
        if (pack.role === "pet") continue; // adults only in the trend
        row[firstName(pack.name)] = toChartValue(pack.baseGrams);
      }
      return row;
    });
  }, [trips, settings, unit]);

  if (isLoading || points.length < 2) return null;

  const trendDown = computeTrendDirection(points, adults);

  return (
    <section className="rounded-xl bg-card p-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2">
            <TrendingDown className="size-3.5" />
            Base Weight Over Time
          </h3>
          <p className="text-[11px] text-outline mt-1">
            Across {points.length} trips. {trendDown && `You're trending lighter.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="text-[11px] text-outline hover:text-primary transition-colors"
        >
          {showAll ? "Hide details" : "Show details"}
        </button>
      </header>

      <div className="h-48 -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline)" opacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              axisLine={{ stroke: "var(--outline)", opacity: 0.3 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              axisLine={{ stroke: "var(--outline)", opacity: 0.3 }}
              tickLine={false}
              width={36}
              tickFormatter={(v) => `${v}${chartUnitLabel}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--outline-variant)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => `${value} ${chartUnitLabel}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {adults.map((adult, i) => (
              <Line
                key={adult.id}
                type="monotone"
                dataKey={firstName(adult.name)}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showAll && <TripList points={points} unit={unit} />}

      <TripMetricsTrend trips={trips as Trip[] | undefined} />
    </section>
  );
}

// ── Distance / Elevation trend ───────────────────────────────────────────────

interface MetricsPoint {
  tripId: string;
  tripName: string;
  date: string;
  iso: number;
  distance: number | null;
  elevation: number | null;
}

/**
 * Distance (mi) + elevation gain (ft) per trip, for trips that have the
 * metadata filled in. Rendered below the base-weight chart on the dashboard
 * so all trend visuals live together. Hidden until ≥ 2 trips with the data.
 */
function TripMetricsTrend({ trips }: { trips: Trip[] | undefined }) {
  const points = useMemo<MetricsPoint[]>(() => {
    if (!trips) return [];
    const withMetric = trips
      .filter(
        (t) =>
          t.startDate &&
          ((t.distanceMiles ?? null) !== null || (t.elevationGainFt ?? null) !== null)
      )
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
      });
    return withMetric.map((t) => ({
      tripId: t.id,
      tripName: t.name,
      date: formatShort(t.startDate),
      iso: t.startDate ? new Date(t.startDate).getTime() : 0,
      distance: t.distanceMiles ?? null,
      elevation: t.elevationGainFt ?? null,
    }));
  }, [trips]);

  if (points.length < 2) return null;

  const hasDistance = points.some((p) => p.distance !== null);
  const hasElevation = points.some((p) => p.elevation !== null);

  return (
    <div className="mt-6 pt-6 border-t border-outline-variant/10">
      <header className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2">
          <Mountain className="size-3.5" />
          Distance &amp; Elevation
        </h3>
        <p className="text-[11px] text-outline mt-1">
          Across {points.length} trips with planned metadata.
        </p>
      </header>

      <div className="h-40 -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline)" opacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              axisLine={{ stroke: "var(--outline)", opacity: 0.3 }}
              tickLine={false}
            />
            <YAxis
              yAxisId="distance"
              orientation="left"
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              axisLine={{ stroke: "var(--outline)", opacity: 0.3 }}
              tickLine={false}
              width={32}
              tickFormatter={(v) => `${v}mi`}
            />
            <YAxis
              yAxisId="elevation"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              axisLine={{ stroke: "var(--outline)", opacity: 0.3 }}
              tickLine={false}
              width={48}
              tickFormatter={(v) => `${Math.round(v / 1000)}k ft`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--outline-variant)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === "Distance") return [`${value} mi`, name];
                if (name === "Elevation Gain") return [`${value} ft`, name];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {hasDistance && (
              <Line
                yAxisId="distance"
                type="monotone"
                dataKey="distance"
                name="Distance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )}
            {hasElevation && (
              <Line
                yAxisId="elevation"
                type="monotone"
                dataKey="elevation"
                name="Elevation Gain"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TripList({
  points,
  unit,
}: {
  points: TrendPoint[];
  unit: ReturnType<typeof useWeightUnit>["unit"];
}) {
  return (
    <div className="mt-4 border-t border-outline-variant/10 pt-4 space-y-1.5">
      {points.map((p) => (
        <Link
          key={p.tripId}
          href={`/app/trips/${p.tripId}`}
          className="flex items-center justify-between gap-3 text-xs rounded-md px-2 py-1.5 hover:bg-surface-high transition-colors"
        >
          <span className="flex items-center gap-1.5 text-outline">
            <Calendar className="size-3" />
            {p.date}
          </span>
          <span className="font-semibold flex-1 truncate">{p.tripName}</span>
          <span className="text-[10px] text-outline font-mono">{chartValuesForTrip(p, unit)}</span>
        </Link>
      ))}
    </div>
  );
}

function chartValuesForTrip(p: TrendPoint, unit: string): string {
  const chartUnitLabel = unit === "kg" || unit === "g" ? "kg" : "lb";
  const parts: string[] = [];
  for (const key of Object.keys(p)) {
    if (["tripId", "tripName", "date", "iso"].includes(key)) continue;
    const v = p[key];
    if (typeof v === "number") parts.push(`${key}: ${v} ${chartUnitLabel}`);
  }
  return parts.join(" · ");
}

function computeTrendDirection(points: TrendPoint[], adults: User[]): boolean {
  if (points.length < 3) return false;
  // Simple heuristic: if the average across the last 3 points is lower than
  // the first 3, call it a downtrend.
  let trendingDown = false;
  for (const adult of adults) {
    const key = firstName(adult.name);
    const early = points.slice(0, Math.min(3, points.length)).map((p) => p[key]);
    const late = points.slice(-Math.min(3, points.length)).map((p) => p[key]);
    const earlyNums = early.filter((v): v is number => typeof v === "number");
    const lateNums = late.filter((v): v is number => typeof v === "number");
    if (!earlyNums.length || !lateNums.length) continue;
    const earlyAvg = earlyNums.reduce((s, v) => s + v, 0) / earlyNums.length;
    const lateAvg = lateNums.reduce((s, v) => s + v, 0) / lateNums.length;
    if (lateAvg < earlyAvg) trendingDown = true;
  }
  return trendingDown;
}

const LINE_COLORS = [
  "#22c55e", // primary green
  "#3b82f6", // blue
  "#f97316", // orange
  "#a855f7", // purple
  "#14b8a6", // teal
];

function firstName(name: string): string {
  return name.split(/\s+/)[0] || name;
}

function formatShort(iso: string | null): string {
  if (!iso) return "";
  const d = iso.includes("T") ? new Date(iso) : new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
