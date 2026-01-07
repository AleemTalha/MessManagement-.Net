import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://messmanagement-net.onrender.com';

export const useUserTransactions = () => {
  return useQuery({
    queryKey: ['userTransactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/user/transactions`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
