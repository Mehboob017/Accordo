import AccountPoints from '@/components/account/points';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const Points = () => {
  return (
    <ProtectedRoute>
      <AccountPoints />
    </ProtectedRoute>
  );
};

export default Points;
