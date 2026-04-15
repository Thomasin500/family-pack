"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displayWeight, gramsToOz, ozToGrams } from "@/lib/weight";
import { useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { useItemHistory } from "@/hooks/use-item-history";
import { getVeterancyLevel, getVeterancyColor } from "@/lib/gear-veterancy";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";
import { Pencil, Trash2 } from "lucide-react";
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

function getItemType(item: Item): {
  label: string;
  short: string;
  variant: "default" | "secondary" | "outline";
} {
  if (item.isWorn) return { label: "Worn", short: "W", variant: "secondary" };
  if (item.isConsumable) return { label: "Consumable", short: "C", variant: "outline" };
  return { label: "Base", short: "B", variant: "default" };
}

function InlineEditName({ item, onSave }: { item: Item; onSave: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEditing() {
    setEditValue(item.name);
    setEditing(true);
  }

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name) {
      onSave(trimmed);
    }
  }, [editValue, item.name, onSave]);

  if (!editing) {
    return (
      <button
        type="button"
        className="text-left hover:underline decoration-dashed underline-offset-4 cursor-text"
        onClick={startEditing}
      >
        <div className="font-medium">{item.name}</div>
        {(item.brand || item.model) && (
          <div className="text-xs text-muted-foreground">
            {[item.brand, item.model].filter(Boolean).join(" ")}
          </div>
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      className="h-7 text-sm"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

function InlineEditWeight({
  item,
  unit,
  onSave,
}: {
  item: Item;
  unit: "imperial" | "metric";
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
    if (unit === "metric") {
      setEditValue(item.weightGrams.toString());
    } else {
      setEditValue(gramsToOz(item.weightGrams).toFixed(1));
    }
    setEditing(true);
  }

  const commit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const newGrams = unit === "metric" ? Math.round(parsed) : ozToGrams(parsed);
      if (newGrams !== item.weightGrams) {
        onSave(newGrams);
      }
    }
  }, [editValue, item.weightGrams, onSave, unit]);

  if (!editing) {
    return (
      <button
        type="button"
        className="tabular-nums hover:underline decoration-dashed underline-offset-4 cursor-text"
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
        step={unit === "metric" ? "1" : "0.1"}
        min="0"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <span className="text-xs text-muted-foreground">{unit === "metric" ? "g" : "oz"}</span>
    </div>
  );
}

export function ItemTable({ items, categories, readOnly = false }: ItemTableProps) {
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { unit } = useWeightUnit();
  const { data: itemHistory } = useItemHistory();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <div className="mb-3 rounded-full bg-muted p-3">
          <svg
            className="size-6 text-muted-foreground"
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
        <p className="font-medium mb-1">No gear yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first piece of gear to start tracking weights.
        </p>
      </div>
    );
  }

  // Sort categories by sortOrder and group items
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const grouped = sortedCategories
    .map((cat) => ({
      category: cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  // Items with no category or unknown category
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

  const grandTotal = items.reduce((s, i) => s + (i.weightGrams ?? 0), 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Name</TableHead>
          <TableHead className="w-[20%]">Weight</TableHead>
          <TableHead className="w-[15%]">Type</TableHead>
          {!readOnly && <TableHead className="w-[25%] text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {grouped.map(({ category, items: catItems }) => {
          const subtotal = catItems.reduce((s, i) => s + (i.weightGrams ?? 0), 0);
          return (
            <CategoryGroup
              key={category.id}
              category={category}
              items={catItems}
              subtotal={subtotal}
              readOnly={readOnly}
              unit={unit}
              itemHistory={itemHistory}
              onUpdateName={(id, name) => updateItem.mutate({ id, name })}
              onUpdateWeight={(id, weightGrams) => updateItem.mutate({ id, weightGrams })}
              onDelete={(id) => deleteItem.mutate(id)}
            />
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold">Total</TableCell>
          <TableCell className="font-semibold tabular-nums">
            {displayWeight(grandTotal, unit)}
          </TableCell>
          <TableCell />
          {!readOnly && <TableCell />}
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function CategoryGroup({
  category,
  items,
  subtotal,
  readOnly,
  unit,
  itemHistory,
  onUpdateName,
  onUpdateWeight,
  onDelete,
}: {
  category: Category;
  items: Item[];
  subtotal: number;
  readOnly: boolean;
  unit: "imperial" | "metric";
  itemHistory?: Record<string, number>;
  onUpdateName: (id: string, name: string) => void;
  onUpdateWeight: (id: string, weightGrams: number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {/* Category header row */}
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableCell
          colSpan={readOnly ? 3 : 4}
          className="py-1.5"
          style={{ borderLeft: `4px solid ${category.color}` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category.name}
            </span>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {displayWeight(subtotal, unit)}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Item rows */}
      {items.map((item) => {
        const type = getItemType(item);
        return (
          <TableRow key={item.id} style={{ borderLeft: `4px solid ${category.color}` }}>
            <TableCell>
              {readOnly ? (
                <div>
                  <div className="font-medium">{item.name}</div>
                  {(item.brand || item.model) && (
                    <div className="text-xs text-muted-foreground">
                      {[item.brand, item.model].filter(Boolean).join(" ")}
                    </div>
                  )}
                </div>
              ) : (
                <InlineEditName item={item} onSave={(name) => onUpdateName(item.id, name)} />
              )}
            </TableCell>
            <TableCell>
              {readOnly ? (
                <span className="tabular-nums">{displayWeight(item.weightGrams, unit)}</span>
              ) : (
                <InlineEditWeight
                  item={item}
                  unit={unit}
                  onSave={(grams) => onUpdateWeight(item.id, grams)}
                />
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={type.variant}
                  className={
                    type.short === "W"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-transparent"
                      : type.short === "C"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-transparent"
                        : ""
                  }
                >
                  {type.short}
                </Badge>
                {itemHistory &&
                  (() => {
                    const tripCount = itemHistory[item.id] ?? 0;
                    const level = getVeterancyLevel(tripCount);
                    if (level === "New") return null;
                    return (
                      <span
                        className={`text-[10px] font-medium ${getVeterancyColor(level)}`}
                        title={`${tripCount} trip${tripCount !== 1 ? "s" : ""}`}
                      >
                        {level}
                      </span>
                    );
                  })()}
              </div>
            </TableCell>
            {!readOnly && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      /* edit opens inline, no-op here for now */
                    }}
                    aria-label="Edit item"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
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
                </div>
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );
}
