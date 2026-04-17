"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { mutationError } from "@/lib/mutation-errors";
import type { HouseholdData } from "@/types";

export function useHousehold() {
  return useQuery({
    queryKey: ["household"],
    queryFn: () => fetchApi<HouseholdData>("/api/household"),
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      fetchApi("/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("create household"),
  });
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; settings?: unknown }) =>
      fetchApi("/api/household", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("save household settings"),
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { inviteCode: string }) =>
      fetchApi("/api/household/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("join household"),
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      role: string;
      bodyWeightKg?: number;
      breed?: string;
      birthDate?: string;
    }) =>
      fetchApi("/api/household/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("add member"),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      name?: string;
      bodyWeightKg?: number | null;
      breed?: string | null;
      heightCm?: number | null;
      birthDate?: string | null;
      sex?: string | null;
    }) =>
      fetchApi(`/api/household/members/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("update member"),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/household/members/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: mutationError("remove member"),
  });
}
