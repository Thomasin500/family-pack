import { ROADMAP, type PhaseStatus } from "@/lib/roadmap";
import { CheckCircle2, Circle, Clock, Dot } from "lucide-react";
import {
  GeneralSuggestButton,
  GeneralSuggestionsList,
  PhaseSuggestions,
  SuggestButton,
} from "@/components/roadmap/suggestions-panel";

export const metadata = {
  title: "Roadmap",
};

const STATUS_META: Record<
  PhaseStatus,
  { label: string; badgeClass: string; Icon: typeof CheckCircle2 }
> = {
  done: {
    label: "Done",
    badgeClass: "bg-primary/15 text-primary",
    Icon: CheckCircle2,
  },
  partial: {
    label: "In progress",
    badgeClass: "bg-secondary/15 text-secondary",
    Icon: Clock,
  },
  next: {
    label: "Next up",
    badgeClass: "bg-secondary/20 text-secondary",
    Icon: Dot,
  },
  planned: {
    label: "Planned",
    badgeClass: "bg-surface-high text-outline",
    Icon: Circle,
  },
};

export default function RoadmapPage() {
  const doneCount = ROADMAP.filter((p) => p.status === "done").length;
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">Roadmap</h1>
          <p className="text-outline text-lg">
            Where Family Pack has been and where it&apos;s going.
          </p>
          <p className="text-xs font-mono tabular-nums text-outline mt-2">
            {doneCount} of {ROADMAP.length} phases done.
          </p>
        </div>
        <SuggestButton variant="hero" />
      </header>

      <ol className="relative border-l border-outline-variant/20 ml-3 space-y-10">
        {ROADMAP.map((phase) => {
          const meta = STATUS_META[phase.status];
          const MetaIcon = meta.Icon;
          return (
            <li key={phase.id} className="pl-8 relative">
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
        })}
      </ol>

      <section className="mt-16">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">General suggestions</h2>
            <p className="text-sm text-outline mt-1">
              Anything not tied to a specific phase. Phase-specific suggestions show up inline
              above.
            </p>
          </div>
          <GeneralSuggestButton />
        </div>
        <GeneralSuggestionsList />
      </section>
    </div>
  );
}
