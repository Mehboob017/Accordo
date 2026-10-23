import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from '@/api/customer-address.api';
import { useUser } from './useUser';

export const useCustomerAddresses = (options = {}) => {
  return useQuery({
    queryKey: ['customer-addresses'],
    queryFn: fetchCustomerAddresses,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useAddCustomerAddress = (options = {}) => {
  const { refetchUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['customer-address-add'],
    mutationFn: (payload) => addCustomerAddress(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      refetchUser && refetchUser();
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
};

export const useUpdateCustomerAddress = (options = {}) => {
  const { refetchUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['customer-address-update'],
    mutationFn: ({ userId, payload }) =>
      updateCustomerAddress({ userId, payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      refetchUser && refetchUser();
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
};

export const useDeleteCustomerAddress = (options = {}) => {
  const { refetchUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['customer-address-delete'],
    mutationFn: (userId) => deleteCustomerAddress(userId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      refetchUser && refetchUser();
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
};
