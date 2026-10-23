import { placeOrder } from '@/api/checkout.api';
import {
  addProductReview,
  fetchReturnNew,
  fetchReturnOverview,
  fetchMyOrders,
  fetchOrderDetail,
  fetchReturnDetail,
  orderAgain,
  cancelOrder,
  cancelReturnRequest,
  rateOrder,
  paymentCancelled,
} from '@/api/orders.api';
import {
  mapApiOrderToCardModel,
  mapOrderDetailToOrderModel,
} from '@/utils/orders/orderTransformers';
import {
  mapReturnsOverviewToModel,
  mapReturnsNewToModel,
} from '@/utils/orders/returnTransformers';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const mapMyOrdersPayload = (payload, page, limit) => {
  const rawOrders = Array.isArray(payload?.data) ? payload.data : [];
  const orders = rawOrders.map(mapApiOrderToCardModel);

  return {
    success: Boolean(payload?.success),
    message: payload?.message || '',
    orders,
    meta: payload?.meta || {
      total: 0,
      page,
      limit,
      pages: 0,
    },
  };
};

export const usePlaceOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      if (typeof onSuccess === 'function') {
        return onSuccess(...args);
      }

      return undefined;
    },
    ...restOptions,
  });
};

export const useMyOrders = (params = {}, options = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['my-orders', page, limit],
    queryFn: () => fetchMyOrders({ page, limit }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    select: (payload) => mapMyOrdersPayload(payload, page, limit),
    ...options,
  });
};

export const useInfiniteMyOrders = (params = {}, options = {}) => {
  const { limit = 10 } = params;

  return useInfiniteQuery({
    queryKey: ['my-orders', 'infinite', limit],
    queryFn: ({ pageParam }) =>
      fetchMyOrders({ page: pageParam, limit }).then((payload) =>
        mapMyOrdersPayload(payload, pageParam, limit)
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta || {};
      const currentPage = Number(meta.page);
      const totalPages = Number(meta.pages);

      if (
        Number.isFinite(currentPage) &&
        Number.isFinite(totalPages) &&
        currentPage < totalPages
      ) {
        return currentPage + 1;
      }

      return undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...options,
  });
};

export const useOrderDetail = (orderUid, options = {}) => {
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['order-detail', orderUid],
    queryFn: () => fetchOrderDetail(orderUid),
    enabled: Boolean(orderUid) && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (payload) => {
      // console.log({ payload });
      return {
        success: Boolean(payload?.success),
        message: payload?.message || '',
        order: payload?.data ? mapOrderDetailToOrderModel(payload.data) : null,
      };
    },
    ...restOptions,
  });
};

export const useReturnOverview = (trxUid, options = {}) => {
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['return-overview', trxUid],
    queryFn: () => fetchReturnOverview(trxUid),
    enabled: Boolean(trxUid) && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (payload) => mapReturnsOverviewToModel(payload),
    ...restOptions,
  });
};

export const useReturnNew = (trxUid, options = {}) => {
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['return-new', trxUid],
    queryFn: () => fetchReturnNew(trxUid),
    enabled: Boolean(trxUid) && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (payload) => mapReturnsNewToModel(payload),
    ...restOptions,
  });
};

export const useReturnDetail = (returnUid, options = {}) => {
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['return-detail', returnUid],
    queryFn: () => fetchReturnDetail(returnUid),
    enabled: Boolean(returnUid) && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...restOptions,
  });
};

export const useAddProductReview = (trxUid, options = {}) => {
  return useMutation({
    mutationKey: ['add-product-review', trxUid],
    mutationFn: (payload) => {
      // console.log('Submitting review with payload:', payload);
      return addProductReview(trxUid, payload)
    },
    ...options,
  })
};

export const useOrderAgain = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationKey: ['order-again'],
    mutationFn: (payload) => orderAgain(payload),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['order-detail'] });

      if (typeof onSuccess === 'function') {
        return onSuccess(...args);
      }

      return undefined;
    },
    ...restOptions,
  });
};

export const useCancelOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationKey: ['cancel-order'],
    mutationFn: ({ trxUid } = {}) => cancelOrder(trxUid),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      await queryClient.invalidateQueries({ queryKey: ['return-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['return-new'] });

      if (variables?.trxUid) {
        await queryClient.invalidateQueries({
          queryKey: ['order-detail', variables.trxUid],
        });
        await queryClient.invalidateQueries({
          queryKey: ['return-overview', variables.trxUid],
        });
        await queryClient.invalidateQueries({
          queryKey: ['return-new', variables.trxUid],
        });
      }

      if (typeof onSuccess === 'function') {
        return onSuccess(_data, variables, _context);
      }

      return undefined;
    },
    ...restOptions,
  });
};

export const usePaymentCancel = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationKey: ['cancel-order'],
    mutationFn: (payload) => paymentCancelled(payload),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      // console.log({ variables });

      if (typeof onSuccess === 'function') {
        return onSuccess(_data, variables, _context);
      }
      return undefined;
    },
    ...restOptions,
  });
};

export const useCancelReturnRequest = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationKey: ['cancel-return-request'],
    mutationFn: ({ returnUid } = {}) => cancelReturnRequest(returnUid),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['return-detail'] });

      // console.log('Invalidated my-orders and return-detail queries', variables);
      if (variables?.returnUid) {
        await queryClient.invalidateQueries({
          queryKey: ['return-detail', variables.returnUid],
        });
      }

      if (typeof onSuccess === 'function') {
        // console.log('Calling onSuccess callback for cancel-return-request', _data, variables, _context);
        return onSuccess(_data, variables, _context);
      }

      return undefined;
    },
    ...restOptions,
  });
};

export const useRateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationKey: ['rate-order'],
    mutationFn: ({ trxUid, payload } = {}) => rateOrder(trxUid, payload),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['order-detail'] });

      if (variables?.trxUid) {
        await queryClient.invalidateQueries({
          queryKey: ['order-detail', variables.trxUid],
        });
      }

      if (typeof onSuccess === 'function') {
        return onSuccess(_data, variables, _context);
      }

      return undefined;
    },
    ...restOptions,
  });
}