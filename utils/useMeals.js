"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5205";

// Fetch all meals
const fetchMeals = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/meals`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meals");
  }

  return response.json();
};

// Fetch single meal by ID
const fetchMealById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/meals/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meal");
  }

  return response.json();
};

// Create new meal
const createMeal = async (mealData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/meals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(mealData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create meal");
  }

  return response.json();
};

// Update meal
const updateMeal = async ({ id, data }) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/meals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update meal");
  }

  return response.json();
};

// Delete meal
const deleteMeal = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/meals/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete meal");
  }

  return response.json();
};

// Custom hooks

// Hook to fetch all meals
export const useMeals = () => {
  return useQuery({
    queryKey: ["meals"],
    queryFn: fetchMeals,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch single meal
export const useMeal = (id) => {
  return useQuery({
    queryKey: ["meals", id],
    queryFn: () => fetchMealById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create meal
export const useCreateMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeal,
    onMutate: async (newMeal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["meals"] });

      // Snapshot previous value
      const previousMeals = queryClient.getQueryData(["meals"]);

      // Optimistically update with temporary ID
      queryClient.setQueryData(["meals"], (old) => [
        ...(old || []),
        { ...newMeal, id: `temp-${Date.now()}`, isOptimistic: true },
      ]);

      return { previousMeals };
    },
    onError: (err, newMeal, context) => {
      // Rollback on error
      queryClient.setQueryData(["meals"], context.previousMeals);
    },
    onSuccess: () => {
      // Refetch to get accurate data from server
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
};

// Hook to update meal
export const useUpdateMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMeal,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["meals"] });
      await queryClient.cancelQueries({ queryKey: ["meals", id] });

      // Snapshot previous values
      const previousMeals = queryClient.getQueryData(["meals"]);
      const previousMeal = queryClient.getQueryData(["meals", id]);

      // Optimistically update
      queryClient.setQueryData(["meals"], (old) =>
        old?.map((meal) =>
          meal.id === id ? { ...meal, ...data, isUpdating: true } : meal
        )
      );

      queryClient.setQueryData(["meals", id], (old) => ({
        ...old,
        ...data,
        isUpdating: true,
      }));

      return { previousMeals, previousMeal };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(["meals"], context.previousMeals);
      if (context.previousMeal) {
        queryClient.setQueryData(["meals", variables.id], context.previousMeal);
      }
    },
    onSuccess: (data, variables) => {
      // Update with actual server response
      queryClient.setQueryData(["meals"], (old) =>
        old?.map((meal) => (meal.id === variables.id ? data : meal))
      );
      queryClient.setQueryData(["meals", variables.id], data);
    },
  });
};

// Hook to delete meal
export const useDeleteMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeal,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["meals"] });

      // Snapshot previous value
      const previousMeals = queryClient.getQueryData(["meals"]);

      // Optimistically mark as deleting
      queryClient.setQueryData(["meals"], (old) =>
        old?.map((meal) =>
          meal.id === id ? { ...meal, isDeleting: true } : meal
        )
      );

      return { previousMeals };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(["meals"], context.previousMeals);
    },
    onSuccess: (data, deletedId) => {
      // Remove from cache only after successful deletion
      queryClient.setQueryData(["meals"], (old) =>
        old?.filter((meal) => meal.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: ["meals", deletedId] });
    },
  });
};
