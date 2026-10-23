'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RiCheckboxCircleFill, RiMapPinLine, RiCoinsLine } from 'react-icons/ri';
import { useOrderDetail } from '@/utils/hooks/useMyOrders';
import styles from './OrderSuccessPage.module.scss';
import { trackMetaEvent } from '@/utils/metaPixel';
import { playOrderSuccessSound } from '@/utils/orderSuccessSound';

const Confetti = dynamic(() => import('react-confetti-boom'), { ssr: false });

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

// ── Sub-components ────────────────────────────────────────────────────────────

const ItemRow = ({ item }) => {
  const isFreeGift = Boolean(item?.isFreeGift);
  const quantity = Number(item?.quantity || 1);
  const subtotal = Number(item?.subTotal || Number(item?.price || 0) * quantity);

  return (
    <li className={styles.item}>
      <div className={styles.thumb}>
        {item?.image && (
          <img src={item.image} alt={item.name || 'Product'} loading="lazy" />
        )}
        {quantity > 1 && <span className={styles.qty}>{quantity}</span>}
      </div>
      <div className={styles.itemInfo}>
        <p className={styles.itemName}>{item?.name || '—'}</p>
        <p className={styles.itemMeta}>
          {item?.variant}
          {item?.variant ? ` • ` : ''}
          Qty {quantity}
        </p>
      </div>
      {isFreeGift ? (
        <span className={styles.freeTag}>FREE</span>
      ) : (
        <span className={styles.itemPrice}>{fmt(subtotal)}</span>
      )}
    </li>
  );
};

const SkeletonBlock = ({ height = 16, width = '100%', mb = 0 }) => (
  <div
    className={styles.skeleton}
    style={{ height, width, marginBottom: mb }}
    aria-hidden="true"
  />
);

// ── Main component ────────────────────────────────────────────────────────────

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [redirectIn, setRedirectIn] = useState(50);
  // const [soundBlocked, setSoundBlocked] = useState(false);

  const orderId = searchParams.get('orderId') || '';

  const [trxUid] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('_osTrxUid') || '';
  });

  useEffect(() => {
    if (trxUid) {
      sessionStorage.removeItem('_osTrxUid');
    }
  }, [trxUid]);

  useEffect(() => {
    // If no orderId, redirect immediately
    if (!orderId) {
      router.replace('/account/orders');
      return;
    }

    // If countdown reaches 0, trigger the redirect
    if (redirectIn === 0) {
      router.replace('/account/orders');
      window.location.href = '/account/orders';
      return;
    }

    // Otherwise, tick down every 1 second
    const timer = setTimeout(() => {
      setRedirectIn((prev) => prev - 1);
    }, 1000);

    // Cleanup the timeout on unmount or re-render
    return () => clearTimeout(timer);
  }, [orderId, redirectIn, router]);

  useEffect(() => {
    if (!orderId) return;

    const storageKey = `order-success-sound:${orderId}`;

    // Already played for this order.
    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    let cancelled = false;

    const playSound = async () => {
      const played = await playOrderSuccessSound();

      if (cancelled) return;

      if (played) {
        sessionStorage.setItem(storageKey, 'played');
        setSoundBlocked(false);
      } else {
        setSoundBlocked(true);
      }
    };

    playSound();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const { data: orderData, isLoading } = useOrderDetail(trxUid, {
    enabled: Boolean(trxUid),
  });

  // console.log(orderData);

  // Extract totalCoinsEarned directly from the parent API response object
  const totalCoinsEarned = orderData?.order?.totalCoinsEarned;
  const order = orderData?.order || null;

  const confettiFired = useRef(false);

  // Fallback to orderNumber from your explicit API response if orderId is missing
  const displayOrderId = order?.orderId || orderData?.orderNumber || orderId || '';

  useEffect(() => {
    if (!order || !displayOrderId) return;

    const purchaseStorageKey = `meta_purchase_tracked_${displayOrderId}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(purchaseStorageKey)) {
      return;
    }

    const orderTotal = Number(
      order.total || order.payableAmount || order.summary?.grandTotal || 0
    );
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const totalQuantity = orderItems.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 1),
      0
    );

    trackMetaEvent('Purchase', {
      content_ids: orderItems
        .map((item) => String(item?.variantUid || item?.variantId || item?.id))
        .filter(Boolean),
      content_type: 'product',
      value: orderTotal,
      currency: 'INR',
      num_items: totalQuantity || 1,
      contents: orderItems.map((item) => ({
        id: String(item?.variantUid || item?.variantId || item?.id),
        quantity: Number(item?.quantity) || 1,
        item_price: Number(item?.price || 0),
      })),
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(purchaseStorageKey, 'true');
    }
  }, [order, displayOrderId]);

  return (
    <>
      {!confettiFired.current &&
        (() => {
          confettiFired.current = true;
          return null;
        })()}
      <Confetti
        mode="fall"
        autoStart
        sound={false}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          pointerEvents: 'none',
        }}
        x={0.5}
        y={0}
        particleCount={150}
        deg={90}
        spreadDeg={45}
        launchSpeed={0.8}
        explosionSpeed={4}
        fallSpeed={1.8}
        effectCount={1}
        effectInterval={0}
        shapeSize={8}
        opacity={1}
        tweenDuration={1000}
        colors={[
          '#ff1744',
          '#ff9100',
          '#ffd600',
          '#00e676',
          '#00b0ff',
          '#d500f9',
          '#fefefe',
        ]}
      />

      <div className={styles.page}>
        <div className={styles.inner}>
          {/* ── Hero ── */}
          <div className={styles.hero}>
            <div className={styles.icon}>
              <RiCheckboxCircleFill />
            </div>
            <h1 className={styles.title}>Order Placed Successfully!</h1>
            {displayOrderId && (
              <p className={styles.orderId}>
                Order Number: <strong>#{displayOrderId}</strong>
              </p>
            )}
            <p className={styles.orderId} style={{ marginTop: 4 }}>
              We&apos;ll notify you once your order is on its way.
            </p>
            <p className={styles.orderId} style={{ marginTop: 6, marginBottom: 0 }}>
              Redirecting you to orders page in <strong>{redirectIn}</strong> seconds.
            </p>
          </div>

          {/* ── Coins / Rewards Card ── */}
          {(isLoading || totalCoinsEarned > 0) && (
            <div className={`${styles.card} ${styles.rewardsCard}`}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SkeletonBlock height={32} width="32px" />
                  <div style={{ flex: 1 }}>
                    <SkeletonBlock height={14} width="40%" mb={4} />
                    <SkeletonBlock height={12} width="60%" />
                  </div>
                </div>
              ) : (
                <div className={styles.rewardsWrapper}>
                  <div className={styles.rewardsIcon}>
                    <RiCoinsLine />
                  </div>
                  <div className={styles.rewardsContent}>
                    <p className={styles.rewardsTitle}>
                      You earned <strong>{totalCoinsEarned}</strong> coins!
                    </p>
                    <p className={styles.rewardsSubtitle}>
                      Use them on your next checkout for instant discounts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Delivery Address ── */}
          {/* {(isLoading || order?.deliveryAddress) && (
            <div className={styles.card}>
              <p className={styles.sectionTitle}>
                <RiMapPinLine
                  style={{ verticalAlign: 'middle', marginRight: 6 }}
                />
                Delivery Address
              </p>

              {isLoading ? (
                <>
                  <SkeletonBlock height={14} width="55%" mb={8} />
                  <SkeletonBlock height={12} width="80%" mb={5} />
                  <SkeletonBlock height={12} width="60%" />
                </>
              ) : (
                <>
                  {order?.receiverName && (
                    <p className={styles.addressName}>{order.receiverName}</p>
                  )}
                  <p className={styles.addressText}>{order?.deliveryAddress}</p>
                  {order?.receiverPhone && (
                    <p className={styles.addressText} style={{ marginTop: 4 }}>
                      {order.receiverPhone}
                    </p>
                  )}
                </>
              )}
            </div>
          )} */}

          {/* ── Actions ── */}
          <div className={styles.actions}>
            <Link href="/account/orders" replace className={styles.btnPrimary}>
              View My Orders
            </Link>
            <Link href="/collections" replace className={styles.btnSecondary}>
              Continue Shopping
            </Link>
          </div>
          {/* <div className={styles.actions}>
            {soundBlocked && (
              <button
                type="button"
                onClick={async () => {
                  const played = await playOrderSuccessSound();

                  if (played) {
                    sessionStorage.setItem(
                      `order-success-sound:${orderId}`,
                      'played'
                    );

                    setSoundBlocked(false);
                  }
                }}
                className={styles.soundButton}
              >
                🔊 Play confirmation sound
              </button>
            )}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;