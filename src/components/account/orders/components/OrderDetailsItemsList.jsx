'use client';

import useImagePreload from '@/utils/hooks/useImagePreload';

// const PRODUCT_PLACEHOLDER_SRC = '/assets/images/placeholder.png';

const FLAT_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
};

const PreloadedOrderItemThumb = ({ item }) => {
  const quantity = Number(item?.quantity || 1);
  const { resolvedSrc, isLoading } = useImagePreload(item?.image, {
    fallbackSrc: '',
  });

  return (
    <div className="thumb">
      {isLoading ? (
        <div className="imageSkeleton" style={{ width: '48px', height: '48px' }} />
      ) : (
        <img
          src={resolvedSrc || ''}
          alt={item?.name || 'Product'}
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {quantity > 1 && <span className="count">{quantity}</span>}
    </div>
  );
};

const OrderDetailsItemsList = ({
  items = [],
  orderId,
  currentOrderStatus,
  onOpenProduct,
  isResolvingProductRedirect,
  redirectingVariantUid,
}) => {
  return (
    <ul className="order-items order-summary-section">
      {(Array.isArray(items) ? items : []).map((item, index) => {
        const isFreeGift = Boolean(item?.isFreeGift);
        const quantity = Number(item?.quantity || 1);
        const itemCouponDiscountAmount = Math.max(
          0,
          Number(item?.discountCodeAmount || 0)
        );
        const itemOfferDiscountAmount = Math.max(
          0,
          Number(item?.offerDiscountAmount || 0)
        );
        const itemCoinDiscountAmount = Math.max(
          0,
          Number(item?.coinDiscountAmount ?? item?.coinDiscount ?? 0)
        );
        const itemSlabDiscountAmount = Math.max(
          0,
          Number(item?.slabDiscountAmount || 0)
        );
        const totalDiscountAmount =
          itemCouponDiscountAmount +
          itemOfferDiscountAmount +
          itemCoinDiscountAmount +
          itemSlabDiscountAmount;
        const variantUid = String(item?.variantUid || item?.variantId || '').trim();
        const canOpenProduct = Boolean(variantUid);
        const isRedirectingCurrentItem =
          isResolvingProductRedirect && redirectingVariantUid === variantUid;
        const itemName = isFreeGift
          ? String(item?.name || '').trim() || 'Free product'
          : String(item?.name || '').trim();
        const currentStatus = String(
          item?.currentStatus || ''
        )
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, '_');
        const isCancelledItem =
          currentStatus === 'cancelled' || currentStatus === 'canceled';

        return (
          <li
            className={`order-item ${isCancelledItem ? 'disabled' : ''}`}
            key={`${orderId || 'order'}-${item?.id || index}`}
          >
            {canOpenProduct ? (
              <button
                type="button"
                style={FLAT_BUTTON_STYLE}
                onClick={() => onOpenProduct(item)}
                disabled={isRedirectingCurrentItem}
                aria-label={`Open ${itemName || 'product'}`}
              >
                <PreloadedOrderItemThumb item={item} />
              </button>
            ) : (
              <PreloadedOrderItemThumb item={item} />
            )}

            <div className="info">
              {canOpenProduct ? (
                <button
                  type="button"
                  className="name"
                  style={FLAT_BUTTON_STYLE}
                  onClick={() => onOpenProduct(item)}
                  disabled={isRedirectingCurrentItem}
                >
                  {itemName || '-'}
                </button>
              ) : (
                <span className="name">{itemName || '-'}</span>
              )}
              <span className="meta">
                {item?.variant}
                {` • Qty ${item?.quantity}`}
              </span>
              {isCancelledItem && (
                <span className="meta current-status">Cancelled</span>
              )}
              {!isFreeGift && totalDiscountAmount > 0 && (
                <span className="meta success fw-bold d-block">
                  Discount - ₹{totalDiscountAmount.toFixed(2)}
                </span>
              )}
              {/* {isFreeGift && (
                <span className="meta success fw-bold d-block">FREE</span>
              )} */}
            </div>

            <div className="price">
              {isFreeGift ? (
                <span
                  className="current"
                  style={{ color: 'var(--theme-color)', fontWeight: 700 }}
                >
                  FREE
                </span>
              ) : (
                <>
                  <span className="current">
                    ₹
                    {Number(
                      item?.subTotal || Number(item?.price || 0) * quantity
                    ).toFixed(2)}
                  </span>
                  {Number(item?.mrp || 0) > Number(item?.price || 0) && (
                    <del>₹{(Number(item?.mrp || 0) * quantity).toFixed(2)}</del>
                  )}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default OrderDetailsItemsList;
