import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://https://messmanagement-net-1.onrender.com";

export const useBills = (page = 1, limit = 10, userId = "", userName = "") => {
  return useQuery({
    queryKey: ["bills", page, limit, userId, userName],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (userId) params.append("userId", userId);
      if (userName) params.append("userName", userName);

      const response = await fetch(`${API_BASE_URL}/api/admin/bills/get?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch bills");
      }

      return response.json();
    },
  });
};

export const useGenerateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, month, year }) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/bills/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, month, year }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate bill");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
};

export const useUpdateBillPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, paidAmount }) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/bills/${billId}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ paidAmount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update payment");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Payment updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update payment");
    },
  });
};