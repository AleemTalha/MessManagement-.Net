import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net.onrender.com";


export const useAttendance = (month, year, page = 1, limit = 30) => {
  return useQuery({
    queryKey: ["attendance", month, year, page, limit],
    queryFn: async () => {
      if (!month || !year) {
        throw new Error("Month and year are required");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/attendance/monthly?month=${month}&year=${year}&page=${page}&limit=${limit}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch attendance data");
      }

      return response.json();
    },
    enabled: !!month && !!year,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year, day, attendance }) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/attendance/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ month, year, day, attendance }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save attendance");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["attendance", variables.month, variables.year] 
      });
    },
  });
};

export const useUserAttendance = () => {
  return useQuery({
    queryKey: ["userAttendance"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/user/attendance`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user attendance");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
