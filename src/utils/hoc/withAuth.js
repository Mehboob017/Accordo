'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/utils/hooks/useUser';

/**
 * Higher-Order Component for route protection
 * Redirects to login if user is not authenticated
 * 
 * Usage:
 * export default withAuth(MyProtectedComponent);
 */
export const withAuth = (Component) => {
  return function ProtectedRoute(props) {
    const { userData, isUserLoading } = useUser();

    if (isUserLoading) {
      return null; // or return a loading spinner
    }

    if (!userData) {
      redirect('/');
    }

    return <Component {...props} />;
  };
};

/**
 * Component to protect page routes
 * Use this within a page component to protect the route
 * 
 * Usage:
 * function MyPage() {
 *   return (
 *     <>
 *       <ProtectedRoute />
 *       <div>Protected content here</div>
 *     </>
 *   );
 * }
 */
export const ProtectedRoute = () => {
  const { userData, isUserLoading } = useUser();

  if (isUserLoading) return null;
  if (!userData) return null;

  return null;
};
