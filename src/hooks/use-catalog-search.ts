"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import type { CatalogProduct } from "@/types";

export function useCatalogSearch(query: string) {
  return useQuery({
    queryKey: ["catalog-search", query],
    queryFn: () => fetchApi<CatalogProduct[]>(`/api/catalog/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}
