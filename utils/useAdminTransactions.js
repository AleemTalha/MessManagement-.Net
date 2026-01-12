import { useQuery } from '@tanstack/react-query';
import { getFetchOptions } from './authHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://messmanagement-net.onrender.com';

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions`, getFetchOptions({ method: 'GET' }));

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
