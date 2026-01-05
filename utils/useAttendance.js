import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5205";

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
    enabled: !!month && !!year, // Only run query when month and year are provided
  });
};