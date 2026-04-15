"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useHousehold } from "@/hooks/use-household";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { ItemTable } from "@/components/closet/item-table";
import { WeightSummary } from "@/components/closet/weight-summary";
import { AddItemDialog } from "@/components/closet/add-item-dialog";
import { Plus } from "lucide-react";

export function ClosetPage() {
  const { data: householdData, isLoading: householdLoading } = useHousehold();
  const { data: allItems, isLoading: itemsLoading } = useItems();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  const members = householdData?.members ?? [];
  const items = allItems ?? [];
  const cats = categories ?? [];

  // Determine the "current user" (first member) and partner (second member)
  const currentUser = members[0];
  const partner = members[1];

  // Set default tab when data loads
  const defaultTab = currentUser?.id ?? "shared";
  const tab = activeTab || defaultTab;

  // Build tab definitions
  const tabs = useMemo(() => {
    const result: {
      id: string;
      label: string;
      ownerType: string;
      ownerId?: string;
      readOnly: boolean;
    }[] = [];

    if (currentUser) {
      result.push({
        id: currentUser.id,
        label: currentUser.name ?? "Mine",
        ownerType: "personal",
        ownerId: currentUser.id,
        readOnly: false,
      });
    }

    if (partner) {
      result.push({
        id: partner.id,
        label: partner.name ?? "Partner",
        ownerType: "personal",
        ownerId: partner.id,
        readOnly: true,
      });
    }

    result.push({
      id: "shared",
      label: "Shared",
      ownerType: "shared",
      ownerId: undefined,
      readOnly: false,
    });

    return result;
  }, [currentUser, partner]);

  // Active tab definition (used for header button visibility + dialog defaults)
  const activeTabDef = tabs.find((t) => t.id === tab) ?? tabs[0];

  if (householdLoading || itemsLoading || categoriesLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading gear closet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gear Closet</h1>
        {activeTabDef && !activeTabDef.readOnly && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Add Item
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => {
          const tabItems =
            t.ownerType === "shared"
              ? items.filter((i: any) => i.ownerType === "shared")
              : items.filter(
                  (i: any) =>
                    i.ownerType === "personal" && i.ownerId === t.ownerId
                );
          return (
            <TabsContent key={t.id} value={t.id}>
              <div className="mt-4 space-y-4">
                <WeightSummary items={tabItems} />
                <ItemTable
                  items={tabItems}
                  categories={cats}
                  readOnly={t.readOnly}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={cats}
        defaultOwnerType={
          activeTabDef?.ownerType === "shared" ? "shared" : "personal"
        }
        defaultOwnerId={currentUser?.id ?? ""}
      />
    </div>
  );
}
