import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5205";

export const useAdminAbsenceApplications = (status = null) => {
  return useQuery({
    queryKey: ["admin-absence-applications", status],
    queryFn: async () => {
      const url = status
        ? `${API_BASE_URL}/api/admin/absence-applications?status=${status}`
        : `${API_BASE_URL}/api/admin/absence-applications`;
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch absence applications");
      }
      return response.json();
    },
  });
};

export const useReviewAbsenceApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/absence-application/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to review application");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-absence-applications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};