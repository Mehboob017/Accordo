import { useQuery } from '@tanstack/react-query';
import { fetchCheckout } from '@/api/checkout.api';

export const useCheckout = (params, options = {}) => {
  return useQuery({
    queryKey: ['checkout', params],
    queryFn: () => fetchCheckout(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    enabled: Boolean(params?.productUid && params?.variantUid),
    ...options,
  });
};