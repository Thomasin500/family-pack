import { ROADMAP } from "@/lib/roadmap";
import {
  GeneralSuggestButton,
  GeneralSuggestionsList,
  SuggestButton,
} from "@/components/roadmap/suggestions-panel";
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";

export const metadata = {
  title: "Roadmap",
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

      <RoadmapTimeline />

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
