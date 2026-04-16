"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";

export function useItems(ownerId?: string) {
  const url = ownerId ? `/api/items?ownerId=${ownerId}` : "/api/items";
  return useQuery({
    queryKey: ["items", ownerId],
    queryFn: () => fetchApi<any[]>(url),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi("/api/items", {
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
    mutationFn: (data: { id: string } & Record<string, unknown>) =>
      fetchApi(`/api/items/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData(["items"]);
      queryClient.setQueryData(["items"], (old: any[]) =>
        old?.map((item: any) => (item.id === updated.id ? { ...item, ...updated } : item))
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
