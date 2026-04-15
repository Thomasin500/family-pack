"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";

export function useAddToPack(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { packId: string } & Record<string, unknown>) =>
      fetchApi(`/api/trips/${tripId}/packs/${data.packId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });
}

export function useUpdatePackItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { packId: string; itemId: string } & Record<string, unknown>) =>
      fetchApi(`/api/trips/${tripId}/packs/${data.packId}/items/${data.itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });
}

export function useRemoveFromPack(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { packId: string; itemId: string }) =>
      fetchApi(`/api/trips/${tripId}/packs/${data.packId}/items/${data.itemId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });
}
