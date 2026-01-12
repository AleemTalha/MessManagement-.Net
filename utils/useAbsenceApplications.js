import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getFetchOptions } from "./authHelper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net.onrender.com";

export const useUserAbsenceApplications = () => {
  return useQuery({
    queryKey: ["user-absence-applications"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/user/absence-applications`, getFetchOptions());
      if (!response.ok) {
        throw new Error("Failed to fetch absence applications");
      }
      return response.json();
    },
  });
};

export const useSubmitAbsenceApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/api/user/absence-application`, getFetchOptions({
        method: "POST",
        body: JSON.stringify({ date: data.date, type: data.type || "Absence" }),
      }));
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["user-absence-applications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};