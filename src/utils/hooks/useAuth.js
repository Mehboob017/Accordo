import {
  login,
  resendOtp,
  verifyOtp,
  logout,
  createProfile,
  doctorSpecializations,
  updateProfile,
  checkProfilePhone,
  verifyProfilePhone,
} from '@/api/auth.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from './useUser';
import { CART_QUERY_KEY } from './useCart';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Helper function to set theme cookie based on user role
const setThemeCookie = (userData) => {
  if (!userData) return;

  const isDoctor = userData.isDoctor || userData.role === 'Doctor' || userData.role === 'doctor';
  const theme = isDoctor ? 'doctor' : 'customer';

  // Set theme cookie with 1 year expiry
  Cookies.set('theme', theme, { expires: 365 });
};

const callMutationCallback = async (callback, ...args) => {
  if (typeof callback === 'function') {
    await callback(...args);
  }
};

const invalidateCartQuery = async (queryClient) => {
  queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
};

const invalidateHomeQuery = async (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['home'] });
}

const invalidateCheckoutAndAddressQueries = async (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
  queryClient.invalidateQueries({ queryKey: ['checkout'] });

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('checkout-offcanvas-data');
  }
};

export const useLogin = (options = {}) => {
  const queryClient = useQueryClient();
  const { refetchUser } = useUser();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationKey: 'login',
    mutationFn: ({ phone, turnstileToken }) => login({ phone, turnstileToken }),
    onSuccess: async (data, variables, context) => {
      // console.log(data);
      // Store token in sessionStorage
      if (data?.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('userToken', data.data.token);
        await invalidateHomeQuery(queryClient);
        await invalidateCartQuery(queryClient);
        await invalidateCheckoutAndAddressQueries(queryClient);
        await refetchUser?.();
      }
      // Set theme cookie based on user role
      if (data?.data?.user) {
        setThemeCookie(data.data.user);
      }
      await callMutationCallback(onSuccess, data, variables, context);
    },
  });
};

export const useResendOtp = (options = {}) => {
  return useMutation({
    mutationKey: 'resend-otp',
    mutationFn: ({ phone }) => resendOtp({ phone }),
    ...options,
  });
};

export const useVerifyOtp = (options = {}) => {
  const queryClient = useQueryClient();
  const { refetchUser } = useUser();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationKey: 'verify-otp',
    mutationFn: ({ phone, otp }) => verifyOtp({ phone, otp }),
    onSuccess: async (data, variables, context) => {
      // Store token in sessionStorage if present in response
      if (data?.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('userToken', data.data.token);
        await invalidateCartQuery(queryClient);
        await invalidateCheckoutAndAddressQueries(queryClient);
      }
      // Set theme cookie based on user role
      if (data?.data?.user) {
        setThemeCookie(data.data.user);
      }
      // Refetch user data
      if (data?.success) {
        await refetchUser?.();
      }
      await callMutationCallback(onSuccess, data, variables, context);
    },
  });
};

export const useLogout = (options = {}) => {
  const queryClient = useQueryClient();
  const { logout: logoutUser } = useUser();
  const router = useRouter();

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: ({ phone }) => logout({ phone }),
    onSuccess: async (data, variables, context) => {
      router.push('/');
      logoutUser();
      queryClient.clear();

      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },

    ...options,
  });
};

export const useCreateProfile = (options = {}) => {
  const queryClient = useQueryClient();
  const { refetchUser } = useUser();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationKey: 'create-profile',
    mutationFn: (profileData) => {
      // console.log("Creating profile with data: ", profileData);
      return createProfile(profileData);
    },
    onSuccess: async (data, variables, context) => {
      // Store token in sessionStorage if present in response
      if (data?.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('userToken', data.data.token);
        await invalidateCartQuery(queryClient);
        await invalidateCheckoutAndAddressQueries(queryClient);
      }
      // Set theme cookie based on user role
      if (data?.data?.user) {
        setThemeCookie(data.data.user);
      }
      // Refetch user data
      await refetchUser?.();
      await callMutationCallback(onSuccess, data, variables, context);
    },
  });
};

export const useDoctorSpecializations = (options = {}) => {
  return useQuery({
    queryKey: ['doctor-specializations'],
    queryFn: async () => {
      return doctorSpecializations();
    },
    ...options,
  });
};

export const useCheckProfilePhone = (options = {}) => {
  return useMutation({
    mutationKey: 'profile-check-phone',
    mutationFn: ({ phone }) => checkProfilePhone({ phone }),
    ...options,
  });
};

export const useVerifyProfilePhone = (options = {}) => {
  return useMutation({
    mutationKey: 'profile-verify-phone',
    mutationFn: ({ phone, otp }) => verifyProfilePhone({ phone, otp }),
    ...options,
  });
};

export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();
  const { refetchUser } = useUser();
  const { onSuccess, onError, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationKey: 'update-profile',
    mutationFn: (profileData) => updateProfile(profileData),
    onSuccess: async (data, variables, context) => {
      if (data?.success) {
        // getauthcustomer is cached under `user-profile` in UserProvider.
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        await refetchUser?.();
      }

      await callMutationCallback(onSuccess, data, variables, context);
    },
    onError: async (error, variables, context) => {
      await callMutationCallback(onError, error, variables, context);
    },
  });
};
