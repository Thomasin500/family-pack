"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { mutationError } from "@/lib/mutation-errors";
import type { Trip } from "@/types";

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchApi<Trip[]>("/api/trips"),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchApi<Trip>(`/api/trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      memberIds: string[];
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      season?: string;
      terrain?: string;
    }) =>
      fetchApi<Trip>("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: mutationError("create trip"),
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: { id: string } & Partial<
        Omit<
          Trip,
          "id" | "createdAt" | "updatedAt" | "householdId" | "createdByUserId" | "members" | "packs"
        >
      >
    ) =>
      fetchApi<Trip>(`/api/trips/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.id] });
    },
    onError: mutationError("update trip"),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/trips/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: mutationError("delete trip"),
  });
}

export function useAddTripMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      fetchApi(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: mutationError("add trip member"),
  });
}

export function useRemoveTripMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      fetchApi(`/api/trips/${tripId}/members?userId=${userId}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: mutationError("remove trip member"),
  });
}

export function useDuplicateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<Trip>(`/api/trips/${id}/duplicate`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: mutationError("duplicate trip"),
  });
}
