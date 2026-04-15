"use client";

import { useHousehold } from "@/hooks/use-household";
import { HouseholdSetup } from "@/components/app/household-setup";
import { Dashboard } from "@/components/app/dashboard";
import { Loader2 } from "lucide-react";

export default function AppPage() {
  const { data, isLoading } = useHousehold();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.household) {
    return <HouseholdSetup />;
  }

  return <Dashboard />;
}
