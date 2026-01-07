import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net-1.onrender.com";

export const useUserBills = () => {
  return useQuery({
    queryKey: ["user-bills"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/user/bills`, {
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

export const usePayBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, amount, paymentMethod, transactionId, notes }) => {
      const response = await fetch(`${API_BASE_URL}/api/user/bills/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          billId,
          amount,
          paymentMethod: paymentMethod || "Card",
          transactionId: transactionId || "",
          notes: notes || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process payment");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Payment processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-bills"] });
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed");
    },
  });
};