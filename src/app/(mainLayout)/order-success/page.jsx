import { Suspense } from 'react';
import OrderSuccessPage from '@/components/orderSuccess/OrderSuccessPage';

export const metadata = {
  title: 'Order Placed Successfully',
  description: 'Your order has been placed successfully.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <OrderSuccessPage />
    </Suspense>
  );
}
