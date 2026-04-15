"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";

export function useItemHistory() {
  return useQuery({
    queryKey: ["item-history"],
    queryFn: () => fetchApi<Record<string, number>>("/api/items/history"),
    staleTime: 60 * 1000,
  });
}
