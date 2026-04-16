"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, Dot } from "lucide-react";
import { ROADMAP, type PhaseStatus, type RoadmapPhase } from "@/lib/roadmap";
import { PhaseSuggestions, SuggestButton } from "@/components/roadmap/suggestions-panel";

const STATUS_META: Record<
  PhaseStatus,
  { label: string; badgeClass: string; Icon: typeof CheckCircle2 }
> = {
  done: { label: "Done", badgeClass: "bg-primary/15 text-primary", Icon: CheckCircle2 },
  partial: { label: "In progress", badgeClass: "bg-secondary/15 text-secondary", Icon: Clock },
  next: { label: "Next up", badgeClass: "bg-secondary/20 text-secondary", Icon: Dot },
  planned: { label: "Planned", badgeClass: "bg-surface-high text-outline", Icon: Circle },
};

function PhaseItem({ phase }: { phase: RoadmapPhase }) {
  const meta = STATUS_META[phase.status];
  const MetaIcon = meta.Icon;
  return (
    <li className="pl-8 relative">
      <span className="absolute -left-[11px] top-1 flex size-5 items-center justify-center rounded-full bg-background ring-4 ring-background">
        <MetaIcon
          className={`size-5 ${
            phase.status === "done"
              ? "text-primary"
              : phase.status === "partial" || phase.status === "next"
                ? "text-secondary"
                : "text-outline"
          }`}
        />
      </span>
      <div className="flex items-baseline gap-3 flex-wrap mb-2">
        <h2 className="text-xl font-bold tracking-tight">{phase.name}</h2>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.badgeClass}`}
        >
          {meta.label}
        </span>
        <SuggestButton initialPhaseId={phase.id} />
      </div>
      <p className="text-sm text-on-surface-variant mb-4">{phase.summary}</p>
      <ul className="space-y-2">
        {phase.features.map((f, i) => {
          const status = f.status ?? phase.status;
          const done = status === "done";
          return (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-1 size-1.5 rounded-full shrink-0 ${
                  done
                    ? "bg-primary"
                    : status === "next" || status === "partial"
                      ? "bg-secondary"
                      : "bg-outline/50"
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className={done ? "text-on-surface-variant" : "text-foreground"}>
                  {f.title}
                </span>
                {f.description && <span className="text-outline"> — {f.description}</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <PhaseSuggestions phaseId={phase.id} />
    </li>
  );
}

export function RoadmapTimeline() {
  const done = ROADMAP.filter((p) => p.status === "done");
  const active = ROADMAP.filter((p) => p.status !== "done");
  const [doneOpen, setDoneOpen] = useState(false);

  return (
    <div className="space-y-8">
      {done.length > 0 && (
        <section className="rounded-xl border border-outline-variant/15 bg-card">
          <button
            type="button"
            onClick={() => setDoneOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-high transition-colors rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              {doneOpen ? (
                <ChevronDown className="size-4 text-outline shrink-0" />
              ) : (
                <ChevronRight className="size-4 text-outline shrink-0" />
              )}
              <CheckCircle2 className="size-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold tracking-tight">
                Completed phases{" "}
                <span className="text-outline font-mono tabular-nums text-sm ml-1">
                  ({done.length})
                </span>
              </h2>
            </div>
            <span className="text-xs text-outline truncate">
              {done.map((p) => p.name.split("·")[0].trim()).join(" · ")}
            </span>
          </button>
          {doneOpen && (
            <ol className="relative border-l border-outline-variant/20 ml-7 mr-5 mb-5 mt-2 space-y-8">
              {done.map((phase) => (
                <PhaseItem key={phase.id} phase={phase} />
              ))}
            </ol>
          )}
        </section>
      )}

      {active.length > 0 && (
        <ol className="relative border-l border-outline-variant/20 ml-3 space-y-10">
          {active.map((phase) => (
            <PhaseItem key={phase.id} phase={phase} />
          ))}
        </ol>
      )}
    </div>
  );
}
