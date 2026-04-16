"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import type { Item } from "@/types";

export function useItems(ownerId?: string) {
  const url = ownerId ? `/api/items?ownerId=${ownerId}` : "/api/items";
  return useQuery({
    queryKey: ["items", ownerId],
    queryFn: () => fetchApi<Item[]>(url),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      ownerType: "personal" | "shared";
      ownerId: string;
      brand?: string;
      model?: string;
      weightGrams?: number;
      categoryId?: string | null;
      isConsumable?: boolean;
      isWorn?: boolean;
      tags?: string[];
      notes?: string;
      catalogProductId?: string | null;
    }) =>
      fetchApi<Item>("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: { id: string } & Partial<Omit<Item, "id" | "createdAt" | "updatedAt" | "category">>
    ) =>
      fetchApi<Item>(`/api/items/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<Item[]>(["items"]);
      queryClient.setQueryData<Item[]>(["items"], (old) =>
        old?.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["items"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force = false }: { id: string; force?: boolean }) =>
      fetchApi(`/api/items/${id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
