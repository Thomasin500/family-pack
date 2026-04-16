"use client";

import { useState } from "react";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export function ChangelogFooter() {
  const [open, setOpen] = useState(false);
  const latest = CHANGELOG[0];
  if (!latest) return null;

  return (
    <footer className="border-t border-outline-variant/10 bg-surface-low mt-16">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-outline shrink-0">
              {"What's new"}
            </span>
            <span className="text-xs text-outline truncate">
              {formatTimestamp(latest.at)} &bull; {latest.title}
            </span>
          </div>
          {open ? (
            <ChevronUp className="size-4 text-outline shrink-0" />
          ) : (
            <ChevronDown className="size-4 text-outline shrink-0" />
          )}
        </button>

        {open && (
          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 space-y-6 border-t border-outline-variant/10 pt-4">
            {CHANGELOG.map((entry) => (
              <ChangelogSection key={entry.at + entry.title} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

function ChangelogSection({ entry }: { entry: ChangelogEntry }) {
  return (
    <section>
      <h3 className="text-sm font-bold mb-2 flex items-baseline gap-2">
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
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}
