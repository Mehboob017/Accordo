'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import UserContext from '.';
import { getUserProfile } from '@/api/auth.api';
import { useRouter } from 'next/navigation';
import { updateMetaUserData } from '@/utils/metaPixel';

const UserProvider = ({ children, ...props }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('userToken');
    }
    return false;
  });

  const wasAuthenticatedRef = useRef(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  /**
   * Sync auth state across browser tabs
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event) => {
      if (event.key !== 'userToken') return;

      const token = localStorage.getItem('userToken');

      setHasToken(!!token);

      if (token) {
        refetch();
      } else {
        setUserData(null);
        setIsAuthenticated(false);

        queryClient.removeQueries({
          queryKey: ['user-profile'],
        });

        queryClient.removeQueries({
          queryKey: ['customer-addresses'],
        });
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  /**
   * Fetch logged-in user
   */
  const {
    data,
    refetch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
    enabled: hasToken,
    retry: false,
  });

  /**
   * Update authentication state
   */
  useEffect(() => {
    if (data) {
      const user =
        data?.data?.authCustomer ??
        data?.authCustomer ??
        data;

      setUserData(user);
      setIsAuthenticated(true);

      if (user) {
        updateMetaUserData({
          email: user.email,
          phone: user.phone,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          externalId: user.uid || user.id,
        });
      }
      return;
    }

    if (!hasToken || error) {
      setUserData(null);
      setIsAuthenticated(false);
    }
  }, [data, error, hasToken]);

  /**
   * Actions after login
   */
  // useEffect(() => {
  //   const hasJustLoggedIn =
  //     isAuthenticated && !wasAuthenticatedRef.current;

  //   if (hasJustLoggedIn) {
  //     queryClient.invalidateQueries({
  //       queryKey: ['cart'],
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: ['customer-addresses'],
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: ['checkout'],
  //     });

  //     localStorage.removeItem('checkout-offcanvas-data');

  //     router.refresh();
  //   }

  //   wasAuthenticatedRef.current = isAuthenticated;
  // }, [isAuthenticated, queryClient, router]);

  /**
   * Actions after login (Hydration or Actual Login)
   */
  useEffect(() => {
    const hasJustLoggedIn =
      isAuthenticated && !wasAuthenticatedRef.current;

    if (hasJustLoggedIn) {
      // Invalidate queries to ensure fresh data, but DO NOT call router.refresh() here.
      // Next.js will handle the UI updates via React Query's state changes.
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      });

      queryClient.invalidateQueries({
        queryKey: ['customer-addresses'],
      });

      queryClient.invalidateQueries({
        queryKey: ['checkout'],
      });

      localStorage.removeItem('checkout-offcanvas-data');
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, queryClient]); // Removed router dependency

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem('userToken');

    Cookies.remove('theme');

    setHasToken(false);
    setUserData(null);
    setIsAuthenticated(false);

    queryClient.removeQueries({
      queryKey: ['user-profile'],
    });

    queryClient.removeQueries({
      queryKey: ['customer-addresses'],
    });

    router.refresh();
  };

  return (
    <UserContext.Provider
      value={{
        ...props,
        userData,
        setUserData,
        isUserLoading: isLoading,
        isAuthenticated,
        refetchUser: refetch,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;