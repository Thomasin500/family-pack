"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";

interface UserPreferences {
  weightUnitPref: "imperial" | "metric";
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: () => fetchApi<UserPreferences>("/api/user/preferences"),
  });
}

export function useUpdateWeightUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weightUnitPref: "imperial" | "metric") =>
      fetchApi<UserPreferences>("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightUnitPref }),
      }),
    onMutate: async (weightUnitPref) => {
      await queryClient.cancelQueries({ queryKey: ["user-preferences"] });
      const previous = queryClient.getQueryData<UserPreferences>(["user-preferences"]);
      queryClient.setQueryData(["user-preferences"], { weightUnitPref });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["user-preferences"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
}
