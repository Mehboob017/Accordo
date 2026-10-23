import { useContext } from 'react';
import UserContext from '@/helper/userContext';

/**
 * Custom hook to access user context
 * @returns {Object} User context values
 * @property {Object|null} userData - Current user data
 * @property {Function} setUserData - Function to update user data
 * @property {boolean} isUserLoading - Loading state for user data
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {Function} refetchUser - Function to refetch user data
 * @property {Function} logout - Function to logout user
 */
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};
