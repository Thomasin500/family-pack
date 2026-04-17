"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";
import { ChevronDown, ChevronUp, Map, Sparkles } from "lucide-react";

const INITIAL_ITEM_LIMIT = 10;

export function ChangelogFooter() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const latest = CHANGELOG[0];

  // Close on Escape, but don't lock body scroll and don't darken the page.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const { groups, totalItems } = useMemo(() => buildGroups(CHANGELOG), []);
  const visibleItemCount = showAll ? totalItems : Math.min(INITIAL_ITEM_LIMIT, totalItems);
  const hiddenCount = totalItems - visibleItemCount;
  const visibleGroups = useMemo(
    () => truncateGroups(groups, visibleItemCount),
    [groups, visibleItemCount]
  );

  if (!latest) return null;

  const triggerLabel = (
    <div className="flex items-center gap-2 min-w-0">
      <Sparkles className="size-4 text-primary shrink-0" />
      <span className="text-xs font-bold uppercase tracking-widest text-outline shrink-0">
        {"What's new"}
      </span>
      <span className="text-xs text-outline truncate">
        {formatDate(latest.at)} &bull; {latest.title}
      </span>
    </div>
  );

  const roadmapButton = (
    <Link
      href="/app/roadmap"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-outline hover:bg-surface-highest hover:text-foreground transition-colors shrink-0"
      title="View product roadmap"
    >
      <Map className="size-3.5" />
      Roadmap
    </Link>
  );

  return (
    <>
      {/* Inline footer trigger — part of the page flow. The whole row toggles
          the drawer; the Roadmap link at the far right navigates without
          toggling (stopPropagation). */}
      <footer
        onClick={() => setOpen((v) => !v)}
        className="relative border-t border-outline-variant/10 bg-surface-low mt-16 cursor-pointer hover:bg-surface-high transition-colors"
      >
        <div className="mx-auto max-w-7xl px-28 sm:px-32 py-6 flex items-center justify-center gap-2">
          {triggerLabel}
          <span className="text-outline shrink-0">
            {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </span>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">{roadmapButton}</div>
      </footer>

      {/* Drawer — fixed at the bottom, no backdrop, page stays interactive */}
      {open && (
        <div
          role="dialog"
          aria-label="Changelog"
          className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-surface-low border-t border-outline-variant/20 shadow-xl"
          style={{ maxHeight: "55vh" }}
        >
          <div
            onClick={() => setOpen(false)}
            className="relative w-full border-b border-outline-variant/10 bg-surface-high hover:bg-surface-highest cursor-pointer transition-colors"
            aria-label="Close changelog"
          >
            <div className="mx-auto max-w-7xl px-28 sm:px-32 py-3 flex items-center justify-center gap-2">
              {triggerLabel}
              <span className="text-outline shrink-0">
                <ChevronDown className="size-4" />
              </span>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2">{roadmapButton}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-6 py-6 space-y-8">
              {visibleGroups.map((g) => (
                <DateGroup key={g.date} group={g} />
              ))}
              {hiddenCount > 0 && !showAll && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                  className="w-full rounded-md border border-outline-variant/20 bg-surface-high py-2 text-xs font-bold uppercase tracking-widest text-outline hover:bg-surface-highest hover:text-foreground transition-colors"
                >
                  … Show {hiddenCount} older {hiddenCount === 1 ? "change" : "changes"}
                </button>
              )}
              {showAll && totalItems > INITIAL_ITEM_LIMIT && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(false);
                  }}
                  className="w-full rounded-md border border-outline-variant/20 bg-surface-high py-2 text-xs font-bold uppercase tracking-widest text-outline hover:bg-surface-highest hover:text-foreground transition-colors"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface DateGroupData {
  date: string; // formatted for display
  entries: ChangelogEntry[];
}

/**
 * Collapse the flat, newest-first CHANGELOG into date-grouped buckets. Entries
 * land in their display-date bucket (local timezone, no time component) and
 * stay in original order within the bucket.
 */
function buildGroups(entries: ChangelogEntry[]): { groups: DateGroupData[]; totalItems: number } {
  const groups: DateGroupData[] = [];
  let totalItems = 0;
  for (const entry of entries) {
    const date = formatDate(entry.at);
    totalItems += entry.items.length;
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.entries.push(entry);
    else groups.push({ date, entries: [entry] });
  }
  return { groups, totalItems };
}

/**
 * Keep only the first `limit` individual items (counted across entries and
 * groups, newest-first). Entries and groups with zero items after truncation
 * are dropped so we don't render empty headers.
 */
function truncateGroups(groups: DateGroupData[], limit: number): DateGroupData[] {
  let budget = limit;
  const out: DateGroupData[] = [];
  for (const g of groups) {
    if (budget <= 0) break;
    const trimmedEntries: ChangelogEntry[] = [];
    for (const e of g.entries) {
      if (budget <= 0) break;
      if (e.items.length <= budget) {
        trimmedEntries.push(e);
        budget -= e.items.length;
      } else {
        trimmedEntries.push({ ...e, items: e.items.slice(0, budget) });
        budget = 0;
      }
    }
    if (trimmedEntries.length > 0) out.push({ date: g.date, entries: trimmedEntries });
  }
  return out;
}

function DateGroup({ group }: { group: DateGroupData }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-outline border-b border-outline-variant/10 pb-2">
        {group.date}
      </h2>
      {group.entries.map((entry) => (
        <div key={entry.at + entry.title}>
          <h3 className="text-sm font-bold mb-2">{entry.title}</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-on-surface-variant pl-2">
            {entry.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
