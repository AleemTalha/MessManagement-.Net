import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net.onrender.com";

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
    refetchOnWindowFocus: false,
  });
};