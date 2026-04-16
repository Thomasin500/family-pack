"use client";

import { useEffect, useState } from "react";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

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

  return (
    <>
      {/* Inline footer trigger — part of the page flow */}
      <footer className="border-t border-outline-variant/10 bg-surface-low mt-16">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            {triggerLabel}
            {open ? (
              <ChevronDown className="size-4 text-outline shrink-0" />
            ) : (
              <ChevronUp className="size-4 text-outline shrink-0" />
            )}
          </button>
        </div>
      </footer>

      {/* Drawer — fixed at the bottom, no backdrop, page stays interactive */}
      {open && (
        <div
          role="dialog"
          aria-label="Changelog"
          className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-surface-low border-t border-outline-variant/20 shadow-xl"
          style={{ maxHeight: "55vh" }}
        >
          {/* Top bar — whole row toggles closed */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-left border-b border-outline-variant/10 bg-surface-high hover:bg-surface-highest transition-colors"
            aria-label="Close changelog"
          >
            <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-3">
              {triggerLabel}
              <ChevronDown className="size-4 text-outline shrink-0" />
            </div>
          </button>
          {/* Scrollable list */}
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
