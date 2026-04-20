"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CatalogTypeahead } from "@/components/closet/catalog-typeahead";
import { useCreateItem } from "@/hooks/use-items";
import { inputToGrams, unitSuffix } from "@/lib/weight";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";

interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

export interface AddItemOwnerOption {
  /** Stable key — user.id, or "__shared__" for the household. */
  value: string;
  label: string;
  ownerType: "personal" | "shared";
  ownerId: string; // user.id, or household.id for shared
}

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  defaultOwnerType?: "personal" | "shared";
  /** The personal owner used when `owners` isn't supplied (legacy callers). */
  personalOwnerId: string;
  householdId: string;
  /** Full per-member owner list. When provided the dialog renders a per-member
   *  picker (Me / Partner / Birch / Shared) instead of the Personal/Shared
   *  binary. Matches the inline-edit owner dropdown. */
  owners?: AddItemOwnerOption[];
  /** Pre-selects this owner (matches the active closet tab). */
  defaultOwnerKey?: string;
}

type ItemType = "base" | "worn" | "consumable";

export function AddItemDialog({
  open,
  onOpenChange,
  categories,
  defaultOwnerType = "personal",
  personalOwnerId,
  householdId,
  owners,
  defaultOwnerKey,
}: AddItemDialogProps) {
  const createItem = useCreateItem();
  const { unit } = useWeightUnit();
  const weightLabelUnit = unit === "lb" ? "oz" : unit;

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemType, setItemType] = useState<ItemType>("base");
  const [ownerType, setOwnerType] = useState<"personal" | "shared">(defaultOwnerType);
  // Per-member owner key — only used when `owners` is provided.
  const initialOwnerKey =
    defaultOwnerKey ?? (defaultOwnerType === "shared" ? "__shared__" : personalOwnerId);
  const [ownerKey, setOwnerKey] = useState<string>(initialOwnerKey);

  const resetForm = useCallback(() => {
    setName("");
    setBrand("");
    setModel("");
    setWeightInput("");
    setCategoryId("");
    setItemType("base");
    setOwnerType(defaultOwnerType);
    setOwnerKey(
      defaultOwnerKey ?? (defaultOwnerType === "shared" ? "__shared__" : personalOwnerId)
    );
  }, [defaultOwnerType, defaultOwnerKey, personalOwnerId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parsedWeight = parseFloat(weightInput);
      if (!name.trim() || isNaN(parsedWeight)) return;

      // Resolve ownerType + ownerId — prefer the per-member picker if it's
      // wired up, fall back to the legacy binary shape otherwise.
      let resolvedType: "personal" | "shared" = ownerType;
      let resolvedId: string = ownerType === "shared" ? householdId : personalOwnerId;
      if (owners && owners.length > 0) {
        const chosen = owners.find((o) => o.value === ownerKey);
        if (chosen) {
          resolvedType = chosen.ownerType;
          resolvedId = chosen.ownerId;
        }
      }

      createItem.mutate(
        {
          name: name.trim(),
          brand: brand.trim(),
          model: model.trim(),
          weightGrams: inputToGrams(parsedWeight, unit),
          categoryId: categoryId || undefined,
          ownerType: resolvedType,
          ownerId: resolvedId,
          isWorn: itemType === "worn",
          isConsumable: itemType === "consumable",
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        }
      );
    },
    [
      name,
      brand,
      model,
      weightInput,
      unit,
      categoryId,
      itemType,
      ownerType,
      ownerKey,
      owners,
      personalOwnerId,
      householdId,
      createItem,
      resetForm,
      onOpenChange,
    ]
  );

  const handleCatalogSelect = useCallback(
    (suggestion: { brand: string; model: string; categorySuggestion: string | null }) => {
      setBrand(suggestion.brand);
      setModel(suggestion.model);
      const catSuggestion = suggestion.categorySuggestion;
      if (catSuggestion) {
        const matched = categories.find(
          (c) => c.name.toLowerCase() === catSuggestion.toLowerCase()
        );
        if (matched) setCategoryId(matched.id);
      }
    },
    [categories]
  );

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Gear Item</DialogTitle>
          <DialogDescription>Search the catalog or enter details manually.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Name with catalog typeahead */}
          <div className="grid gap-2">
            <Label htmlFor="item-name">Name</Label>
            <CatalogTypeahead value={name} onChange={setName} onSelect={handleCatalogSelect} />
          </div>

          {/* Brand + Model side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="item-brand">Brand</Label>
              <Input
                id="item-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Zpacks"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-model">Model</Label>
              <Input
                id="item-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Duplex"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="grid gap-2">
            <Label htmlFor="item-weight">Weight ({weightLabelUnit})</Label>
            <Input
              id="item-weight"
              type="number"
              step="any"
              min="0"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={`0 ${unitSuffix(unit)}`}
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {sortedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item type: base / worn / consumable */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={itemType} onValueChange={(v) => setItemType(v as ItemType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base weight</SelectItem>
                <SelectItem value="worn">Worn</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Owner — per-member when callers supply the owners list, else
              falls back to the Personal/Shared binary. */}
          <div className="grid gap-2">
            <Label>Owner</Label>
            {owners && owners.length > 0 ? (
              <Select value={ownerKey} onValueChange={setOwnerKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={ownerType}
                onValueChange={(v) => setOwnerType(v as "personal" | "shared")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !weightInput || createItem.isPending}>
              {createItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
