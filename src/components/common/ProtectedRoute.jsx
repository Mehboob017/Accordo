'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/utils/hooks/useUser';
import OtpLoginModal from '../auth/login/OtpLoginModal';
import Loader from '@/layout/loader';

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {string} props.redirectTo - Optional custom redirect path after login
 */
const ProtectedRoute = ({ children, redirectTo }) => {
  const { isAuthenticated, isUserLoading } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const wasAuthenticatedRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      setHasCheckedAuth(true);

      if (!isAuthenticated) {
        if (wasAuthenticatedRef.current) {
          router.push('/');
        } else {
          setShowLoginModal(true);
        }
      }

      wasAuthenticatedRef.current = isAuthenticated;
    }
  }, [isAuthenticated, isUserLoading]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    router.refresh();
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    router.push('/');
  };

  // FIX: Do not drop into full screen loader if the login modal is already visible to the user
  if (!hasCheckedAuth || (isUserLoading && !showLoginModal)) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <OtpLoginModal
        isOpen={showLoginModal}
        onClose={handleModalClose}
        setOpen={setShowLoginModal}
        redirectUrl={redirectTo || pathname}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
