"use client";

import { useState } from "react";
import { CHANGELOG } from "@/lib/changelog";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export function ChangelogFooter() {
  const [open, setOpen] = useState(false);
  const latest = CHANGELOG[0];
  if (!latest) return null;
  const rest = CHANGELOG.slice(1);

  return (
    <footer className="border-t border-outline-variant/10 bg-surface-low mt-16">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
              {"What's new"}
            </span>
            <span className="text-xs text-outline">
              {latest.date} &bull; {latest.title}
            </span>
          </div>
          {open ? (
            <ChevronUp className="size-4 text-outline" />
          ) : (
            <ChevronDown className="size-4 text-outline" />
          )}
        </button>

        {open && (
          <div className="mt-4 space-y-6">
            <ChangelogSection entry={latest} />
            {rest.map((entry) => (
              <ChangelogSection key={entry.date + entry.title} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

function ChangelogSection({ entry }: { entry: (typeof CHANGELOG)[number] }) {
  return (
    <section>
      <h3 className="text-sm font-bold mb-2">
        <span className="text-outline font-mono text-xs mr-2">{entry.date}</span>
        {entry.title}
      </h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-on-surface-variant pl-2">
        {entry.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
