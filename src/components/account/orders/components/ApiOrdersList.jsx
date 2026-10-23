import { useCallback, useEffect, useRef } from 'react';
import ApiOrderCard from './ApiOrderCard';
import { canReviewOrder, getStatusMeta } from '@/utils/orders/statusMapper';

const OrderCardSkeleton = () => (
  <div className="order-card" aria-hidden="true">
    <div className="order-header">
      <div className="order-info">
        <div className="imageSkeleton" style={{ height: 18, width: 140, marginBottom: 8 }} />
        <div className="imageSkeleton" style={{ height: 14, width: 180 }} />
      </div>
      <div className="imageSkeleton" style={{ height: 18, width: 56 }} />
    </div>
    <div className="product-list">
      {[1, 2, 3].map((index) => (
        <div className="product" key={index}>
          <div className="image imageSkeleton" />
        </div>
      ))}
    </div>
    <div className="order-footer">
      <div className="imageSkeleton" style={{ height: 40, width: '100%', borderRadius: 8 }} />
    </div>
  </div>
);

const ApiOrdersList = ({
  orders = [],
  totalOrderCount = 0,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  handleTrackOrderClick,
  getReturnBadgeConfig,
  onOpenOrderDetails,
  onRateOrderClick,
  onOrderAgainClick,
  isOrderAgainPending = false,
  formatPlacedAt,
}) => {
  const sentinelRef = useRef(null);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isLoading) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '400px',
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersection, isLoading]);

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }, (_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </>
    );
  }

  return (
    <>
      {orders.map((order) => {
        const returnBadge = getReturnBadgeConfig(order.id);
        const alreadyHasReview = Boolean(order?.reviews?.length);
        const isDeliveredOrder = canReviewOrder(order?.currentStatus);
        const canRateOrder = isDeliveredOrder && !alreadyHasReview;

        return (
          <ApiOrderCard
            key={order.id}
            order={order}
            handleTrackOrderClick={handleTrackOrderClick}
            statusLabel={getStatusMeta(order?.displayStatus).label}
            returnBadge={returnBadge}
            canRateOrder={canRateOrder}
            onOpenOrderDetails={onOpenOrderDetails}
            onRateOrderClick={onRateOrderClick}
            onOrderAgainClick={onOrderAgainClick}
            isOrderAgainPending={isOrderAgainPending}
            formatPlacedAt={formatPlacedAt}
          />
        );
      })}

      {isFetchingNextPage &&
        Array.from({ length: 2 }, (_, index) => (
          <OrderCardSkeleton key={`loading-${index}`} />
        ))}

      <div ref={sentinelRef} style={{ height: 1, visibility: 'hidden' }} aria-hidden="true" />

      {!hasNextPage && orders.length > 0 && (
        <p
          className="text-center text-muted mt-4 mb-2"
          style={{ fontSize: '0.875rem', letterSpacing: '0.02em' }}
        >
          You&apos;ve seen all {totalOrderCount || orders.length} orders
        </p>
      )}
    </>
  );
};

export default ApiOrdersList;
