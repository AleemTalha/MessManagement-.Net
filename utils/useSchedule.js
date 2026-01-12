"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFetchOptions } from "./authHelper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net.onrender.com";

// Fetch current week schedule
const fetchSchedule = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/schedules`, getFetchOptions());

  if (!response.ok) {
    throw new Error("Failed to fetch schedule");
  }

  return response.json();
};

// Fetch schedule by ID
const fetchScheduleById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/schedules/${id}`, getFetchOptions());

  if (!response.ok) {
    throw new Error("Failed to fetch schedule");
  }

  return response.json();
};

// Create new schedule
const createSchedule = async (scheduleData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/schedules`, getFetchOptions({
    method: "POST",
    body: JSON.stringify(scheduleData),
  }));

  if (!response.ok) {
    let errorMessage = "Failed to create schedule";
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Update schedule
const updateSchedule = async ({ id, data }) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/schedules/${id}`, getFetchOptions({
    method: "PUT",
    body: JSON.stringify(data),
  }));

  if (!response.ok) {
    let errorMessage = "Failed to update schedule";
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Delete schedule
const deleteSchedule = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/schedules/${id}`, getFetchOptions({ method: "DELETE" }));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete schedule");
  }

  return response.json();
};

// Custom hooks

// Hook to fetch schedule
export const useSchedule = () => {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch schedule by ID
export const useScheduleById = (id) => {
  return useQuery({
    queryKey: ["schedule", id],
    queryFn: () => fetchScheduleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create schedule
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (data) => {
      // Set the newly created schedule in cache
      queryClient.setQueryData(["schedule"], data);
    },
  });
};

// Hook to update schedule
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSchedule,
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["schedule"] });
      
      // Snapshot the previous value
      const previousSchedule = queryClient.getQueryData(["schedule"]);
      
      return { previousSchedule };
    },
    onError: (err, variables, context) => {
      // Rollback to previous schedule on error
      if (context?.previousSchedule) {
        queryClient.setQueryData(["schedule"], context.previousSchedule);
      }
    },
    onSuccess: (data) => {
      // Update cache with the full schedule data from backend response
      queryClient.setQueryData(["schedule"], data);
    },
  });
};

// Hook to delete schedule
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
