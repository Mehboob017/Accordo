import AccountAddresses from '@/components/account/addresses';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const Addresses = () => {
  return (
    <ProtectedRoute>
      <AccountAddresses />
    </ProtectedRoute>
  );
};

export default Addresses;
