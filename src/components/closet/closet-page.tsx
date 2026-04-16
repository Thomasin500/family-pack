"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useHousehold } from "@/hooks/use-household";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { ItemTable } from "@/components/closet/item-table";
import { WeightSummary } from "@/components/closet/weight-summary";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Plus, Search, Settings2 } from "lucide-react";
import { CategoryManager } from "@/components/closet/category-manager";

const AddItemDialog = dynamic(
  () => import("@/components/closet/add-item-dialog").then((m) => m.AddItemDialog),
  { ssr: false }
);

export function ClosetPage() {
  const { data: householdData, isLoading: householdLoading } = useHousehold();
  const { data: allItems, isLoading: itemsLoading } = useItems();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const members = householdData?.members ?? [];
  const items = allItems ?? [];
  const cats = categories ?? [];

  const currentUser = members[0];
  const partner = members[1];

  const defaultTab = currentUser?.id ?? "shared";
  const tab = activeTab || defaultTab;

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

    // Add pet members
    members
      .filter((m: any) => m.role === "pet")
      .forEach((pet: any) => {
        result.push({
          id: pet.id,
          label: pet.name ?? "Pet",
          ownerType: "personal",
          ownerId: pet.id,
          readOnly: false,
        });
      });

    result.push({
      id: "shared",
      label: "Shared",
      ownerType: "shared",
      ownerId: undefined,
      readOnly: false,
    });

    return result;
  }, [currentUser, partner, members]);

  const activeTabDef = tabs.find((t) => t.id === tab) ?? tabs[0];

  if (householdLoading || itemsLoading || categoriesLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading gear closet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 pb-48">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Gear Closet</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCategoryManagerOpen(true)}
          title="Manage categories"
          className="text-outline hover:text-foreground"
        >
          <Settings2 className="size-5" />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-8">
          <TabsList>
            {tabs.map((t) => {
              const count =
                t.ownerType === "shared"
                  ? items.filter((i: any) => i.ownerType === "shared").length
                  : items.filter((i: any) => i.ownerType === "personal" && i.ownerId === t.ownerId)
                      .length;
              return (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                  {count > 0 && <span className="ml-1 text-outline">({count})</span>}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {activeTabDef && !activeTabDef.readOnly && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="size-4" data-icon="inline-start" />
              Add Item
            </Button>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-outline" />
          <Input
            placeholder="Search gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-low rounded-xl border-none"
          />
        </div>

        {tabs.map((t) => {
          const ownerItems =
            t.ownerType === "shared"
              ? items.filter((i: any) => i.ownerType === "shared")
              : items.filter((i: any) => i.ownerType === "personal" && i.ownerId === t.ownerId);
          const tabItems = searchQuery.trim()
            ? ownerItems.filter((i: any) => {
                const q = searchQuery.toLowerCase();
                return (
                  i.name?.toLowerCase().includes(q) ||
                  i.brand?.toLowerCase().includes(q) ||
                  i.model?.toLowerCase().includes(q) ||
                  i.category?.name?.toLowerCase().includes(q)
                );
              })
            : ownerItems;
          return (
            <TabsContent key={t.id} value={t.id}>
              <div className="space-y-8">
                <ItemTable items={tabItems} categories={cats} readOnly={t.readOnly} />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Sticky weight summary footer */}
      {activeTabDef && (
        <WeightSummary
          items={
            activeTabDef.ownerType === "shared"
              ? items.filter((i: any) => i.ownerType === "shared")
              : items.filter(
                  (i: any) => i.ownerType === "personal" && i.ownerId === activeTabDef.ownerId
                )
          }
        />
      )}

      <CategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={cats}
        items={items}
      />

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={cats}
        defaultOwnerType={activeTabDef?.ownerType === "shared" ? "shared" : "personal"}
        defaultOwnerId={currentUser?.id ?? ""}
      />
    </div>
  );
}
