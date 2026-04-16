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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  defaultOwnerType?: "personal" | "shared";
  personalOwnerId: string;
  householdId: string;
}

type ItemType = "base" | "worn" | "consumable";

export function AddItemDialog({
  open,
  onOpenChange,
  categories,
  defaultOwnerType = "personal",
  personalOwnerId,
  householdId,
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

  const resetForm = useCallback(() => {
    setName("");
    setBrand("");
    setModel("");
    setWeightInput("");
    setCategoryId("");
    setItemType("base");
    setOwnerType(defaultOwnerType);
  }, [defaultOwnerType]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parsedWeight = parseFloat(weightInput);
      if (!name.trim() || isNaN(parsedWeight)) return;

      createItem.mutate(
        {
          name: name.trim(),
          brand: brand.trim(),
          model: model.trim(),
          weightGrams: inputToGrams(parsedWeight, unit),
          categoryId: categoryId || undefined,
          ownerType,
          ownerId: ownerType === "shared" ? householdId : personalOwnerId,
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

          {/* Owner type */}
          <div className="grid gap-2">
            <Label>Owner</Label>
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
