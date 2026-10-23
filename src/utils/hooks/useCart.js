import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart,
  fetchCart,
  fetchCartPreview,
  removeCartItems,
  removeFromCart,
} from '@/api/cart.api';

export const CART_QUERY_KEY = ['cart'];
export const CART_PREVIEW_QUERY_KEY = ['cart', 'preview'];

const getRepeatCount = (variables = {}) => {
  const parsedCount = Number(variables?.count ?? 1);
  return Number.isFinite(parsedCount) ? Math.max(1, Math.floor(parsedCount)) : 1;
};

const repeatMutation = async (mutationFn, variables) => {
  let lastResponse = null;
  const repeatCount = getRepeatCount(variables);

  for (let index = 0; index < repeatCount; index += 1) {
    lastResponse = await mutationFn(variables);
  }

  return lastResponse;
};

export const useCartQuery = (options = {}) =>
  useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    ...options,
  });

export const useCartPreview = (
  payload = {},
  options = {},
  refreshKey = ''
) =>
  useQuery({
    queryKey: [
      ...CART_PREVIEW_QUERY_KEY,
      String(payload?.couponCode || ''),
      String(payload?.offerUid || ''),
      Number(payload?.coinUsed || 0),
      refreshKey,
    ],
    queryFn: () => fetchCartPreview(payload),
    refetchOnWindowFocus: false,
    staleTime: 0,
    ...options,
  });

export const useAddToCart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables = {}) => {
      const response = await repeatMutation(addToCart, variables);
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      return response;
    },
    ...options,
  });
};

export const useRemoveFromCart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables = {}) => {
      const response = await repeatMutation(removeFromCart, variables);
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      return response;
    },
    ...options,
  });
};

export const useRemoveCartItems = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables = {}) => {
      const response = await removeCartItems(variables);
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      return response;
    },
    ...options,
  });
};