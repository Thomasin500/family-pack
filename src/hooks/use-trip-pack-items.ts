"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { mutationError } from "@/lib/mutation-errors";
import type { TripPackItem } from "@/types";

export function useAddToPack(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      packId: string;
      itemId: string;
      quantity?: number;
      ownedByUserId?: string | null;
      isWornOverride?: boolean | null;
      isConsumableOverride?: boolean | null;
    }) =>
      fetchApi<TripPackItem>(`/api/trips/${tripId}/packs/${data.packId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
    onError: mutationError("add item"),
  });
}

export function useUpdatePackItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      packId: string;
      itemId: string;
      quantity?: number;
      isWornOverride?: boolean | null;
      isConsumableOverride?: boolean | null;
      isBorrowed?: boolean;
      isChecked?: boolean;
      sortOrder?: number;
    }) =>
      fetchApi<TripPackItem>(`/api/trips/${tripId}/packs/${data.packId}/items/${data.itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
    onError: mutationError("update pack item"),
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
    onError: mutationError("remove item from pack"),
  });
}

/**
 * Upsert: create or increment quantity on (packId, itemId).
 * Used by drag-to-pack and click-to-assign flows.
 */
export function useBumpPackItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { packId: string; itemId: string }) =>
      fetchApi<TripPackItem>(`/api/trips/${tripId}/packs/${data.packId}/items/bump`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: data.itemId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
    onError: mutationError("add item to pack"),
  });
}

/**
 * Move a tripPackItem to another pack within the same trip. For stackable
 * items the source is decremented (deleted if qty 1) and the target upserted.
 */
export function useMovePackItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tripPackItemId: string; toPackId: string; sortOrder?: number }) =>
      fetchApi<TripPackItem>(`/api/trips/${tripId}/move-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
    onError: mutationError("move pack item"),
  });
}
