import AccountOrders from '@/components/account/orders';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const Orders = () => {
  return (
    <ProtectedRoute>
      <AccountOrders />
    </ProtectedRoute>
  );
};

export default Orders;
