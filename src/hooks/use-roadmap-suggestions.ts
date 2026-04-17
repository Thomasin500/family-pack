"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import type { RoadmapSuggestion } from "@/db/schema";

export function useRoadmapSuggestions() {
  return useQuery({
    queryKey: ["roadmap-suggestions"],
    queryFn: () => fetchApi<RoadmapSuggestion[]>("/api/roadmap/suggestions"),
  });
}

export function useCreateRoadmapSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phaseId?: string | null; title: string; description: string }) =>
      fetchApi<RoadmapSuggestion>("/api/roadmap/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-suggestions"] }),
  });
}

export function useUpdateRoadmapSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      phaseId?: string | null;
      status?: "open" | "reviewing" | "noted" | "accepted" | "declined";
    }) =>
      fetchApi<RoadmapSuggestion>(`/api/roadmap/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-suggestions"] }),
  });
}

export function useDeleteRoadmapSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi(`/api/roadmap/suggestions?id=${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap-suggestions"] }),
  });
}
