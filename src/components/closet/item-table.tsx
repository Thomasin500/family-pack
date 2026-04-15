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
import { displayWeight } from "@/lib/weight";
import { useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { Pencil, Trash2 } from "lucide-react";
import { gramsToOz, ozToGrams } from "@/lib/weight";

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

function getItemType(item: Item): { label: string; short: string; variant: "default" | "secondary" | "outline" } {
  if (item.isWorn) return { label: "Worn", short: "W", variant: "secondary" };
  if (item.isConsumable) return { label: "Consumable", short: "C", variant: "outline" };
  return { label: "Base", short: "B", variant: "default" };
}

function InlineEditName({
  item,
  onSave,
}: {
  item: Item;
  onSave: (value: string) => void;
}) {
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
  onSave,
}: {
  item: Item;
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
    setEditValue(gramsToOz(item.weightGrams).toFixed(1));
    setEditing(true);
  }

  const commit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const newGrams = ozToGrams(parsed);
      if (newGrams !== item.weightGrams) {
        onSave(newGrams);
      }
    }
  }, [editValue, item.weightGrams, onSave]);

  if (!editing) {
    return (
      <button
        type="button"
        className="tabular-nums hover:underline decoration-dashed underline-offset-4 cursor-text"
        onClick={startEditing}
      >
        {displayWeight(item.weightGrams, "imperial")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        className="h-7 w-16 text-sm tabular-nums"
        type="number"
        step="0.1"
        min="0"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <span className="text-xs text-muted-foreground">oz</span>
    </div>
  );
}

export function ItemTable({ items, categories, readOnly = false }: ItemTableProps) {
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground">
          No items yet. Add your first piece of gear!
        </p>
      </div>
    );
  }

  // Sort categories by sortOrder and group items
  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const grouped = sortedCategories
    .map((cat) => ({
      category: cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  // Items with no category or unknown category
  const uncategorized = items.filter(
    (i) => !i.categoryId || !categoryMap.has(i.categoryId)
  );
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
          const subtotal = catItems.reduce(
            (s, i) => s + (i.weightGrams ?? 0),
            0
          );
          return (
            <CategoryGroup
              key={category.id}
              category={category}
              items={catItems}
              subtotal={subtotal}
              readOnly={readOnly}
              onUpdateName={(id, name) =>
                updateItem.mutate({ id, name })
              }
              onUpdateWeight={(id, weightGrams) =>
                updateItem.mutate({ id, weightGrams })
              }
              onDelete={(id) => deleteItem.mutate(id)}
            />
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold">Total</TableCell>
          <TableCell className="font-semibold tabular-nums">
            {displayWeight(grandTotal, "imperial")}
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
  onUpdateName,
  onUpdateWeight,
  onDelete,
}: {
  category: Category;
  items: Item[];
  subtotal: number;
  readOnly: boolean;
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
              {displayWeight(subtotal, "imperial")}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Item rows */}
      {items.map((item) => {
        const type = getItemType(item);
        return (
          <TableRow
            key={item.id}
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
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
                <InlineEditName
                  item={item}
                  onSave={(name) => onUpdateName(item.id, name)}
                />
              )}
            </TableCell>
            <TableCell>
              {readOnly ? (
                <span className="tabular-nums">
                  {displayWeight(item.weightGrams, "imperial")}
                </span>
              ) : (
                <InlineEditWeight
                  item={item}
                  onSave={(grams) => onUpdateWeight(item.id, grams)}
                />
              )}
            </TableCell>
            <TableCell>
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
                    onClick={() => onDelete(item.id)}
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
