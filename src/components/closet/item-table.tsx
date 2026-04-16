"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displayWeight, gramsToInput, inputToGrams, unitSuffix, inputStep } from "@/lib/weight";
import type { DisplayUnit } from "@/lib/weight";
import { useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { useUpdateCategory } from "@/hooks/use-categories";
import { useItemHistory } from "@/hooks/use-item-history";
import { getVeterancyLevel, getVeterancyColor } from "@/lib/gear-veterancy";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  brand: string;
  model: string;
  weightGrams: number;
  categoryId: string;
  ownerType: string;
  ownerId: string;
  isConsumable: boolean;
  isWorn: boolean;
  tags: string[];
  notes: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

interface ItemTableProps {
  items: Item[];
  categories: Category[];
  readOnly?: boolean;
}

function getItemType(item: Item): { label: string; variant: "default" | "muted" | "outline" } {
  if (item.isWorn) return { label: "Worn", variant: "default" };
  if (item.isConsumable) return { label: "Consumable", variant: "outline" };
  return { label: "Carried", variant: "muted" };
}

function cycleItemType(item: Item): { isWorn: boolean; isConsumable: boolean } {
  if (item.isWorn) return { isWorn: false, isConsumable: true }; // Worn → Consumable
  if (item.isConsumable) return { isWorn: false, isConsumable: false }; // Consumable → Carried
  return { isWorn: true, isConsumable: false }; // Carried → Worn
}

function InlineEditItem({
  item,
  categories,
  onSave,
}: {
  item: Item;
  categories: Category[];
  onSave: (fields: Partial<Item>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [brandVal, setBrandVal] = useState("");
  const [modelVal, setModelVal] = useState("");
  const [categoryVal, setCategoryVal] = useState("");
  const [notesVal, setNotesVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEditing() {
    setNameVal(item.name);
    setBrandVal(item.brand ?? "");
    setModelVal(item.model ?? "");
    setCategoryVal(item.categoryId ?? "");
    setNotesVal(item.notes ?? "");
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const updates: Partial<Item> = {};
    const trimmedName = nameVal.trim();
    if (trimmedName && trimmedName !== item.name) updates.name = trimmedName;
    const trimmedBrand = brandVal.trim();
    if (trimmedBrand !== (item.brand ?? "")) updates.brand = trimmedBrand || "";
    const trimmedModel = modelVal.trim();
    if (trimmedModel !== (item.model ?? "")) updates.model = trimmedModel || "";
    if (categoryVal !== (item.categoryId ?? "")) updates.categoryId = categoryVal || "";
    const trimmedNotes = notesVal.trim();
    if (trimmedNotes !== (item.notes ?? "")) updates.notes = trimmedNotes || "";
    if (Object.keys(updates).length > 0) {
      onSave(updates);
    }
  }

  if (!editing) {
    return (
      <button type="button" className="text-left cursor-text group/name" onClick={startEditing}>
        <div className="font-bold text-foreground">{item.name}</div>
        {(item.brand || item.model) && (
          <div className="text-xs text-outline">
            {[item.brand, item.model].filter(Boolean).join(" ")}
          </div>
        )}
        {item.notes && (
          <div className="text-xs text-outline/60 truncate max-w-[200px]">{item.notes}</div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <Input
        ref={inputRef}
        className="h-7 text-sm font-bold"
        placeholder="Name"
        value={nameVal}
        onChange={(e) => setNameVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <div className="flex gap-1.5">
        <Input
          className="h-6 text-xs flex-1"
          placeholder="Brand"
          value={brandVal}
          onChange={(e) => setBrandVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <Input
          className="h-6 text-xs flex-1"
          placeholder="Model"
          value={modelVal}
          onChange={(e) => setModelVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      </div>
      <div className="flex gap-1.5">
        <select
          className="h-6 text-xs rounded border border-input bg-background px-2 flex-1"
          value={categoryVal}
          onChange={(e) => setCategoryVal(e.target.value)}
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        className="h-6 text-xs"
        placeholder="Notes..."
        value={notesVal}
        onChange={(e) => setNotesVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <div className="flex gap-1.5 justify-end">
        <button
          type="button"
          className="text-[10px] text-outline hover:text-foreground"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="text-[10px] font-bold text-primary hover:text-primary/80"
          onClick={commit}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function InlineEditWeight({
  item,
  unit,
  onSave,
}: {
  item: Item;
  unit: DisplayUnit;
  onSave: (grams: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setEditValue(gramsToInput(item.weightGrams, unit));
    setEditing(true);
  }

  const commit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const newGrams = inputToGrams(parsed, unit);
      if (newGrams !== item.weightGrams) {
        onSave(newGrams);
      }
    }
  }, [editValue, item.weightGrams, onSave, unit]);

  if (!editing) {
    return (
      <button
        type="button"
        className="font-mono tabular-nums text-on-surface-variant cursor-text"
        onClick={startEditing}
      >
        {displayWeight(item.weightGrams, unit)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        className="h-7 w-16 text-sm tabular-nums"
        type="number"
        step={inputStep(unit)}
        min="0"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <span className="text-xs text-outline">{unitSuffix(unit)}</span>
    </div>
  );
}

export function ItemTable({ items, categories, readOnly = false }: ItemTableProps) {
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const updateCategory = useUpdateCategory();
  const { unit } = useWeightUnit();
  const { data: itemHistory } = useItemHistory();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function toggleCollapse(catId: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = grouped.findIndex((g) => g.category.id === active.id);
    const newIndex = grouped.findIndex((g) => g.category.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder and persist
    const reordered = [...grouped];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reordered.forEach((g, i) => {
      if (g.category.id !== "__uncategorized" && g.category.sortOrder !== i) {
        updateCategory.mutate({ id: g.category.id, sortOrder: i });
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 py-16 text-center">
        <div className="mb-3 rounded-full bg-surface-high p-3">
          <svg
            className="size-6 text-outline"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </div>
        <p className="font-bold mb-1">No gear yet</p>
        <p className="text-sm text-outline">
          Add your first piece of gear to start tracking weights.
        </p>
      </div>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const grouped = sortedCategories
    .map((cat) => ({
      category: cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  const uncategorized = items.filter((i) => !i.categoryId || !categoryMap.has(i.categoryId));
  if (uncategorized.length > 0) {
    grouped.push({
      category: {
        id: "__uncategorized",
        name: "Uncategorized",
        color: "#888888",
        sortOrder: 9999,
      },
      items: uncategorized,
    });
  }

  const categoryIds = grouped.map((g) => g.category.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-8">
          {grouped.map(({ category, items: catItems }) => {
            const subtotal = catItems.reduce((s, i) => s + (i.weightGrams ?? 0), 0);
            const isCollapsed = collapsedIds.has(category.id);
            return (
              <SortableCategorySection
                key={category.id}
                category={category}
                items={catItems}
                subtotal={subtotal}
                readOnly={readOnly}
                unit={unit}
                itemHistory={itemHistory}
                allCategories={categories}
                collapsed={isCollapsed}
                onToggleCollapse={() => toggleCollapse(category.id)}
                onUpdateItem={(id, fields) => updateItem.mutate({ id, ...fields })}
                onUpdateWeight={(id, weightGrams) => updateItem.mutate({ id, weightGrams })}
                onUpdateType={(id, isWorn, isConsumable) =>
                  updateItem.mutate({ id, isWorn, isConsumable })
                }
                onDelete={(id, force) => {
                  deleteItem.mutate(
                    { id, force },
                    {
                      onError: (err: any) => {
                        if (err?.tripCount) {
                          toast(`This item is in ${err.tripCount} trip(s). Delete anyway?`, {
                            action: {
                              label: "Delete Anyway",
                              onClick: () => deleteItem.mutate({ id, force: true }),
                            },
                            cancel: { label: "Cancel", onClick: () => {} },
                          });
                        }
                      },
                    }
                  );
                }}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCategorySection(props: {
  category: Category;
  items: Item[];
  subtotal: number;
  readOnly: boolean;
  unit: DisplayUnit;
  itemHistory?: Record<string, number>;
  allCategories: Category[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateItem: (id: string, fields: Partial<Item>) => void;
  onUpdateWeight: (id: string, weightGrams: number) => void;
  onUpdateType: (id: string, isWorn: boolean, isConsumable: boolean) => void;
  onDelete: (id: string, force?: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.category.id,
    disabled: props.category.id === "__uncategorized",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategorySection {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function CategorySection({
  category,
  items,
  subtotal,
  readOnly,
  unit,
  itemHistory,
  allCategories,
  collapsed,
  onToggleCollapse,
  onUpdateItem,
  onUpdateWeight,
  onUpdateType,
  onDelete,
  dragHandleProps,
}: {
  category: Category;
  items: Item[];
  subtotal: number;
  readOnly: boolean;
  unit: DisplayUnit;
  itemHistory?: Record<string, number>;
  allCategories: Category[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateItem: (id: string, fields: Partial<Item>) => void;
  onUpdateWeight: (id: string, weightGrams: number) => void;
  onUpdateType: (id: string, isWorn: boolean, isConsumable: boolean) => void;
  onDelete: (id: string, force?: boolean) => void;
  dragHandleProps?: Record<string, any>;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-card p-6">
      {/* Category color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: category.color }}
      />

      {/* Category header */}
      <div
        className="mb-4 flex items-center justify-between pl-2 cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {!readOnly && category.id !== "__uncategorized" && (
            <div
              className="cursor-grab text-outline hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              {...dragHandleProps}
            >
              <GripVertical className="size-3.5" />
            </div>
          )}
          <div className="text-outline">
            {collapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </div>
          <h2
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: category.color }}
          >
            {category.name}
          </h2>
        </div>
        <span className="font-mono text-xs text-outline">
          {items.length} {items.length === 1 ? "ITEM" : "ITEMS"} &bull;{" "}
          {displayWeight(subtotal, unit).toUpperCase()}
        </span>
      </div>

      {/* Item rows */}
      {!collapsed && (
        <div className="space-y-1">
          {items.map((item, idx) => {
            const type = getItemType(item);
            const tripCount = itemHistory?.[item.id] ?? 0;
            const level = getVeterancyLevel(tripCount);

            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-bright ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-background/40"
                }`}
              >
                <div className="flex flex-1 items-center gap-4">
                  {/* Name + brand */}
                  <div className="flex-1">
                    {readOnly ? (
                      <div>
                        <div className="font-bold">{item.name}</div>
                        {(item.brand || item.model) && (
                          <div className="text-xs text-outline">
                            {[item.brand, item.model].filter(Boolean).join(" ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <InlineEditItem
                        item={item}
                        categories={allCategories}
                        onSave={(fields) => onUpdateItem(item.id, fields)}
                      />
                    )}
                  </div>

                  {/* Badges */}
                  <div className="hidden items-center gap-1.5 md:flex">
                    {readOnly ? (
                      <Badge variant={type.variant}>{type.label}</Badge>
                    ) : (
                      <Badge
                        variant={type.variant}
                        className="cursor-pointer select-none hover:brightness-110 active:scale-95 transition-all"
                        onClick={() => {
                          const next = cycleItemType(item);
                          onUpdateType(item.id, next.isWorn, next.isConsumable);
                        }}
                        title="Click to cycle: Carried → Worn → Consumable"
                      >
                        {type.label}
                      </Badge>
                    )}
                    {level !== "New" && (
                      <Badge variant="outline">
                        <span className={getVeterancyColor(level)}>{level}</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {readOnly ? (
                      <span className="font-mono tabular-nums text-on-surface-variant">
                        {displayWeight(item.weightGrams, unit)}
                      </span>
                    ) : (
                      <InlineEditWeight
                        item={item}
                        unit={unit}
                        onSave={(grams) => onUpdateWeight(item.id, grams)}
                      />
                    )}
                  </div>

                  {/* Delete (hover only) */}
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        toast(`Delete "${item.name}"?`, {
                          action: {
                            label: "Delete",
                            onClick: () => onDelete(item.id),
                          },
                          cancel: { label: "Cancel", onClick: () => {} },
                        });
                      }}
                      aria-label="Delete item"
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
