import Image from 'next/image';
import { RiStarFill } from 'react-icons/ri';
import { CgTrack } from 'react-icons/cg';
import { FaChevronRight } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import useImagePreload from '@/utils/hooks/useImagePreload';
import { getStatusMeta } from '@/utils/orders/statusMapper';

// const PRODUCT_PLACEHOLDER_SRC = '/assets/images/placeholder.png';
const THEME_ICON_STYLE = { color: 'var(--theme-color)' };
const THEME_BADGE_STYLE = {
  background: 'rgba(var(--theme-color-rgb), 0.12)',
  borderColor: 'rgba(var(--theme-color-rgb), 0.22)',
  color: 'var(--theme-color)',
};

const PreloadedProductThumb = ({ item, orderId, index }) => {
  const quantity = Number(item?.quantity || 1);
  const { resolvedSrc, isLoading } = useImagePreload(item?.image, {
    fallbackSrc: '',
  });

  return (
    <div
      className={`product ${item?.currentStatus === 'cancelled' ? 'disabled' : ''} ${quantity > 1 ? 'more' : ''}`}
      key={`${orderId}-${item?.id || index}`}
    >
      {isLoading ? (
        <div className="image imageSkeleton" />
      ) : (
        <Image
          src={resolvedSrc || ''}
          alt={item?.name || 'product'}
          draggable={false}
          width={48}
          height={48}
          className="image"
          unoptimized
        />
      )}
      {quantity > 1 && <span className="count">{quantity}</span>}
    </div>
  );
};

const ApiOrderCard = ({
  order,
  statusLabel,
  returnBadge,
  canRateOrder = false,
  onOpenOrderDetails,
  onRateOrderClick,
  handleTrackOrderClick,
  onOrderAgainClick,
  isOrderAgainPending = false,
  formatPlacedAt,
}) => {
  const isDelivered = String(order?.displayStatus || "").toLowerCase() === "delivered";
  const { icon: StatusIcon, color } = getStatusMeta(order?.displayStatus || statusLabel || '');

  return (
    <div className="order-card" key={order.id}>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onOpenOrderDetails(order);
        }}
        className="order-header"
      >
        <div className="order-info">
          <div className="status">
            <span>{`Order ${String(statusLabel || '').toLowerCase()}`}</span>
            <span style={{
              lineHeight: 1
            }}>
              <StatusIcon style={{ color }} />
            </span>
            {returnBadge && (
              <div className="refund-badge-wrapper">
                <span className="refund-badge" style={THEME_BADGE_STYLE}>
                  {returnBadge}
                </span>
              </div>
            )}
          </div>
          <p className="meta">{`Placed at ${formatPlacedAt(order.placedAt)}`}</p>
        </div>

        <div className="order-actions">
          <span className="price">₹{Number(order.total || 0).toFixed(2)}</span>
          <span className="menu-btn">
            <FaChevronRight size={10} />
          </span>
        </div>
      </a>

      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onOpenOrderDetails(order);
        }}
        className="product-list"
      >
        {(order.items || []).map((item, index) => {
          return (
            <PreloadedProductThumb
              item={item}
              index={index}
              orderId={order.id}
              key={`${order.id}-${item.id || index}`}
            />
          );
        })}
      </a>

      {isDelivered ?
        <div className="order-footer">
          <button
            className="btn secondary"
            onClick={(event) => onRateOrderClick(event, order)}
            disabled={!canRateOrder}
          >
            Rate Order <RiStarFill color="#f5c518" />
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => onOrderAgainClick?.(order)}
            disabled={isOrderAgainPending}
          >
            Order Again
            <IoMdRefresh />
          </button>
        </div>
        :
        <div className="order-footer">
          <button
            className="btn secondary"
            onClick={async (e) => {
              e.preventDefault();
              await onOpenOrderDetails(order);
              setTimeout(() => {
                handleTrackOrderClick?.(e, order);
              }, 500);
            }}
          >
            Track Order <CgTrack color="#f5c518" />
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => onOpenOrderDetails(order)}
          >
            View Order
            <IoMdRefresh />
          </button>
        </div>
      }
    </div>
  );
};

export default ApiOrderCard;
