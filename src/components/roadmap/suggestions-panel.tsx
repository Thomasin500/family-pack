"use client";

import { useMemo, useState } from "react";
import {
  useCreateRoadmapSuggestion,
  useDeleteRoadmapSuggestion,
  useRoadmapSuggestions,
  useUpdateRoadmapSuggestion,
} from "@/hooks/use-roadmap-suggestions";
import { ROADMAP } from "@/lib/roadmap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lightbulb, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import type { RoadmapSuggestion } from "@/db/schema";

interface SuggestionsPanelProps {
  /** Preselect this phase when the dialog opens. */
  initialPhaseId?: string;
  /** Control the trigger's size/look. */
  variant?: "hero" | "inline";
  /** Override the button label. */
  label?: string;
}

/**
 * The main "Suggest an edit" button + modal form. Used from the top of the
 * roadmap page (hero) and from each phase's header (inline).
 */
export function SuggestButton({
  initialPhaseId,
  variant = "inline",
  label,
}: SuggestionsPanelProps) {
  const [open, setOpen] = useState(false);
  const [phaseId, setPhaseId] = useState<string>(initialPhaseId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createSuggestion = useCreateRoadmapSuggestion();

  function reset() {
    setTitle("");
    setDescription("");
    setPhaseId(initialPhaseId ?? "");
  }

  function handleOpenChange(next: boolean) {
    if (next) reset();
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createSuggestion.mutate(
      {
        phaseId: phaseId || null,
        title: title.trim(),
        description: description.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Suggestion submitted");
          setOpen(false);
          reset();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to submit");
        },
      }
    );
  }

  return (
    <>
      {variant === "hero" ? (
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <Lightbulb className="size-4" data-icon="inline-start" />
          {label ?? "Suggest an edit"}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setOpen(true)}
          className="text-outline hover:text-primary"
        >
          <Lightbulb className="size-3.5" data-icon="inline-start" />
          {label ?? "Suggest"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggest a roadmap edit</DialogTitle>
            <DialogDescription>
              Anything goes — new feature idea, tweak to a planned phase, or a bug you want tracked.
              Other household members will see your suggestion.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="suggest-phase">Phase (optional)</Label>
              <select
                id="suggest-phase"
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Anywhere / not specific to a phase</option>
                {ROADMAP.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="suggest-title">Title</Label>
              <Input
                id="suggest-title"
                placeholder="e.g. Add carry-weight warnings for kids"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="suggest-desc">Details</Label>
              <textarea
                id="suggest-desc"
                className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                placeholder="What, why, and any context that helps."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={4000}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !description.trim() || createSuggestion.isPending}
              >
                {createSuggestion.isPending ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SuggestionItem({
  suggestion,
  onDelete,
}: {
  suggestion: RoadmapSuggestion;
  onDelete: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(suggestion.title);
  const [description, setDescription] = useState(suggestion.description);
  const [phaseId, setPhaseId] = useState<string>(suggestion.phaseId ?? "");
  const update = useUpdateRoadmapSuggestion();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) return;
    const currentPhase = suggestion.phaseId ?? "";
    const phaseChanged = phaseId !== currentPhase;
    if (t === suggestion.title && d === suggestion.description && !phaseChanged) {
      setEditing(false);
      return;
    }
    update.mutate(
      {
        id: suggestion.id,
        title: t,
        description: d,
        ...(phaseChanged ? { phaseId: phaseId || null } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Suggestion updated");
          setEditing(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update");
        },
      }
    );
  }

  return (
    <li className="group rounded-lg bg-surface-low p-3 border border-outline-variant/10">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Title"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
            placeholder="Details"
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
          <div className="grid gap-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Phase
            </Label>
            <select
              value={phaseId}
              onChange={(e) => setPhaseId(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">General / not specific to a phase</option>
              {ROADMAP.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTitle(suggestion.title);
                setDescription(suggestion.description);
                setPhaseId(suggestion.phaseId ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim() || !description.trim()}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{suggestion.title}</p>
            <p className="text-sm text-on-surface-variant whitespace-pre-wrap mt-1">
              {suggestion.description}
            </p>
            <p className="text-[10px] text-outline mt-2 font-mono">
              {new Date(suggestion.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setEditing(true)}
              title="Edit suggestion"
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive"
              onClick={() => onDelete(suggestion.id, suggestion.title)}
              title="Delete suggestion"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function useDeleteSuggestion() {
  const deleteSuggestion = useDeleteRoadmapSuggestion();
  const confirm = useConfirm();
  return async function handleDelete(id: string, title: string) {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description: "Removes this suggestion for everyone in the household.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteSuggestion.mutate(id);
  };
}

/** Inline list of suggestions for a single phase. Hidden when empty. */
export function PhaseSuggestions({ phaseId }: { phaseId: string }) {
  const { data } = useRoadmapSuggestions();
  const handleDelete = useDeleteSuggestion();
  const items = useMemo(() => (data ?? []).filter((s) => s.phaseId === phaseId), [data, phaseId]);
  if (items.length === 0) return null;
  return (
    <div className="mt-4 border-l-2 border-primary/30 pl-3">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
        <Lightbulb className="size-3" />
        Suggestions ({items.length})
      </h4>
      <ul className="space-y-2">
        {items.map((s) => (
          <SuggestionItem key={s.id} suggestion={s} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}

/** Non-phase-specific ("General") suggestions. */
export function GeneralSuggestionsList() {
  const { data, isLoading } = useRoadmapSuggestions();
  const handleDelete = useDeleteSuggestion();
  const items = useMemo(() => (data ?? []).filter((s) => !s.phaseId), [data]);

  if (isLoading) return <p className="text-sm text-outline">Loading suggestions…</p>;
  if (items.length === 0) {
    return (
      <p className="text-sm text-outline italic">
        No general suggestions yet. Use the button above to add one.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((s) => (
        <SuggestionItem key={s.id} suggestion={s} onDelete={handleDelete} />
      ))}
    </ul>
  );
}

/** Adds a "General" suggestion (no phase). Always renders a standalone button. */
export function GeneralSuggestButton() {
  return <SuggestButton initialPhaseId="" variant="inline" label="Add general suggestion" />;
}
