"use client";

import { useState } from "react";
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import { useClickOutside } from "@/hooks/use-click-outside";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#6b7280",
];

interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  items: any[];
}

export function CategoryManager({ open, onOpenChange, categories, items }: CategoryManagerProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const confirm = useConfirm();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[5]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [dirtyError, setDirtyError] = useState(false);

  const editingCat = categories.find((c) => c.id === editingId);
  const isEditDirty =
    !!editingCat && (editName.trim() !== editingCat.name || editColor !== editingCat.color);

  const editRef = useClickOutside<HTMLDivElement>(() => {
    if (!editingId) return;
    if (isEditDirty) {
      setDirtyError(true);
    } else {
      setEditingId(null);
    }
  }, !!editingId);

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  function getItemCount(categoryId: string): number {
    return items.filter((i: any) => i.categoryId === categoryId).length;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory.mutate(
      { name: newName.trim(), color: newColor, sortOrder: categories.length },
      {
        onSuccess: () => {
          setNewName("");
          toast.success("Category created");
        },
      }
    );
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setDirtyError(false);
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    updateCategory.mutate(
      { id: editingId, name: editName.trim(), color: editColor },
      {
        onSuccess: () => {
          setEditingId(null);
          setDirtyError(false);
          toast.success("Updated");
        },
      }
    );
  }

  async function handleDelete(cat: Category) {
    const count = getItemCount(cat.id);
    if (count === 0) {
      const ok = await confirm({
        title: `Delete "${cat.name}"?`,
        description: "This category has no items and will be removed.",
        confirmLabel: "Delete",
        destructive: true,
      });
      if (ok) deleteCategory.mutate({ id: cat.id }, { onSuccess: () => toast.success("Deleted") });
      return;
    }
    const otherCats = categories.filter((c) => c.id !== cat.id);
    if (otherCats.length === 0) {
      toast.error(
        `Cannot delete "${cat.name}" — it has ${count} items and there are no other categories to move them to.`
      );
      return;
    }
    const target = otherCats[0];
    const ok = await confirm({
      title: `Delete "${cat.name}"?`,
      description: `"${cat.name}" has ${count} item${count === 1 ? "" : "s"}. They'll be moved to "${target.name}" before the category is deleted.`,
      confirmLabel: `Move & Delete`,
      destructive: true,
    });
    if (ok) {
      deleteCategory.mutate(
        { id: cat.id, force: true, moveTo: target.id },
        {
          onSuccess: () => toast.success(`Items moved to "${target.name}" and category deleted`),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {sorted.map((cat) => {
            const count = getItemCount(cat.id);
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div key={cat.id} ref={editRef} className="space-y-1">
                  <div
                    className={`flex items-center gap-2 rounded-lg bg-surface-low p-2 ${dirtyError ? "ring-2 ring-destructive/60" : ""}`}
                  >
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`size-4 rounded-full border-2 ${editColor === c ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => {
                            setEditColor(c);
                            setDirtyError(false);
                          }}
                        />
                      ))}
                    </div>
                    <Input
                      className="h-7 text-sm flex-1"
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setDirtyError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={saveEdit} disabled={!editName.trim()}>
                      Save
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(null)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                  {dirtyError && (
                    <p className="text-[10px] font-bold text-destructive pl-2">
                      Unsaved changes — Save or press Esc to cancel
                    </p>
                  )}
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="group flex items-center gap-3 rounded-lg bg-surface-low p-3"
              >
                <div
                  className="size-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold">{cat.name}</span>
                  <span className="text-xs text-outline ml-2">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => startEdit(cat)}
                    title="Edit"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(cat)}
                    title="Delete"
                    className="text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleCreate}
          className="flex items-center gap-2 pt-4 border-t border-outline-variant/10"
        >
          <div className="flex gap-1 shrink-0">
            {PRESET_COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                className={`size-4 rounded-full border-2 ${newColor === c ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <Input
            className="h-7 text-sm flex-1"
            placeholder="New category..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={!newName.trim() || createCategory.isPending}>
            <Plus className="size-3" />
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
