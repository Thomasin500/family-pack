"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";
import { ChevronDown, ChevronUp, Map, Sparkles } from "lucide-react";

export function ChangelogFooter() {
  const [open, setOpen] = useState(false);
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

  if (!latest) return null;

  const triggerLabel = (
    <div className="flex items-center gap-2 min-w-0">
      <Sparkles className="size-4 text-primary shrink-0" />
      <span className="text-xs font-bold uppercase tracking-widest text-outline shrink-0">
        {"What's new"}
      </span>
      <span className="text-xs text-outline truncate">
        {formatTimestamp(latest.at)} &bull; {latest.title}
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
            <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
              {CHANGELOG.map((entry) => (
                <ChangelogSection key={entry.at + entry.title} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChangelogSection({ entry }: { entry: ChangelogEntry }) {
  return (
    <section>
      <h3 className="text-sm font-bold mb-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-outline font-mono text-xs tabular-nums">
          {formatTimestamp(entry.at)}
        </span>
        <span>{entry.title}</span>
      </h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-on-surface-variant pl-2">
        {entry.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}
