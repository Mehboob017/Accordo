import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RiCloseFill, RiDownload2Line, RiStarFill, RiImage2Line, RiVideoLine, RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { CgTrack } from 'react-icons/cg';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import { RxCube } from 'react-icons/rx';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import AccountHeading from '@/components/common/AccountHeading';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import NoDataFound from '@/components/common/NoDataFound';
import PageActionOverlay from '@/components/common/PageActionOverlay';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import '../../productDetails/common/allModal/ReviewModal.scss';
import './OrderDetails.scss';
import Btn from '@/elements/buttons/Btn';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  useCancelOrder,
  useInfiniteMyOrders,
  useOrderAgain,
  useOrderDetail,
  useReturnOverview,
} from '@/utils/hooks/useMyOrders';
import {
  loadOrderPrescriptionFiles,
  revokePrescriptionPreviewUrls,
} from '@/utils/prescription/prescriptionStorage';
import RateOrderModal from './RateOrderModal';
import OrderTracking from './OrderTracking';
import OrderDetails from './OrderDetails';
import OrderSummary from './OrderSummary';
import ReturnOrders from './ReturnOrder';
import ApiOrdersList from './components/ApiOrdersList';
import OrderDetailsOffcanvasSkeleton from './components/OrderDetailsOffcanvasSkeleton';
import RefundList from './components/RefundList';
import OrderDetailsItemsList from './components/OrderDetailsItemsList';
import { formatPlacedAt } from '@/utils/orders/orderTransformers';
import { useProductRedirectByVariant } from '@/utils/hooks/useProduct';
import CartContext from '@/helper/cartContext';
import { CART_QUERY_KEY } from '@/utils/hooks/useCart';
import emptyImage from '../../../../public/assets/svg/empty-items.svg';
import {
  canCancelOrder,
  canReturnOrder,
  canReviewOrder,
  getStatusMeta,
} from '@/utils/orders/statusMapper';

const THEME_STATUS_ICON_STYLE = { color: 'var(--theme-color)' };

const normalizeOrderForDetails = (order = {}) => {
  // console.log('test ', { order });

  // Use nullish coalescing (??) to safely grab 0 or negative values like roundingAmount
  const itemTotal = Number(order?.summary?.itemTotal ?? order?.itemTotal ?? 0);
  const mrp = Number(order?.summary?.mrp ?? order?.mrp ?? 0);
  const totalMrp = Number(order?.summary?.totalMrp ?? order?.totalMrp ?? 0);
  const couponDiscount = Number(
    order?.summary?.couponDiscount ?? order?.couponDiscount ?? 0
  );
  const shippingCharge = Number(
    order?.summary?.shippingCharge ?? order?.shippingCharge ?? 0
  );
  const sdlCoinDiscount = Number(
    order?.summary?.sdlCoinDiscount ?? order?.sdlCoinDiscount ?? 0
  );
  const grandTotal = Number(order?.summary?.grandTotal ?? order?.total ?? 0);

  const slabDiscountAmount = Number(
    order?.summary?.slabDiscountAmount ?? order?.slabDiscountAmount ?? 0
  );
  const slabDiscountPercentage = Number(
    order?.summary?.slabDiscountPercentage ?? order?.slabDiscountPercentage ?? 0
  );
  const roundingAmount = Number(
    order?.summary?.roundingAmount ?? order?.roundingAmount ?? 0
  );
  const offerDiscountAmount = Number(
    order?.summary?.offerDiscountAmount ?? order?.offerDiscountAmount ?? 0
  );

  const cartSubtotalExGst = Number(
    order?.summary?.subtotalExGst ?? order?.subtotalExGst ?? 0
  );
  const totalGst = Number(order?.summary?.totalGst ?? order?.totalGst ?? 0);
  const subtotal = Number(order?.summary?.subtotal ?? order?.subtotal ?? 0);

  return {
    ...order,
    displayStatus: order?.displayStatus || '',
    orderId: order?.orderId || order?.id || '-',
    items: Array.isArray(order?.items) ? order.items : [],
    tracking: {
      statusHistory: order?.tracking?.statusHistory || [],
      ...order?.tracking,
    },
    summary: {
      ...(order?.summary || {}),
      mrp,
      totalMrp,
      itemTotal,
      discountedPrice: itemTotal,
      couponDiscount,
      shippingCharge,
      sdlCoinDiscount,
      grandTotal,
      slabDiscountAmount,
      slabDiscountPercentage,
      roundingAmount,
      offerDiscountAmount,
      cartSubtotalExGst,
      totalGst,
      subtotal,
    },
  };
};

const MyOrders = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openCartCanvas } = useContext(CartContext);

  const ORDERS_PER_PAGE = 10;

  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [reviewPreviewModal, setReviewPreviewModal] = useState({ open: false, file: null, index: 0 });
  // const [helpModal, setHelpModal] = useState(false);
  const [returnOrderModal, setReturnOrderModal] = useState(false);
  const [rateOrderModal, setRateOrderModal] = useState(false);
  const [cancelOrderModal, setCancelOrderModal] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedOrderUid, setSelectedOrderUid] = useState('');
  const [returnStatusMap, setReturnStatusMap] = useState({});
  const [activeOrderPrescriptionFiles, setActiveOrderPrescriptionFiles] =
    useState([]);
  const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
  const [redirectingVariantUid, setRedirectingVariantUid] = useState('');
  const {
    mutateAsync: resolveProductRedirectByVariant,
    isPending: isResolvingProductRedirect,
  } = useProductRedirectByVariant();
  const { mutateAsync: triggerOrderAgain, isPending: isOrderAgainPending } =
    useOrderAgain();
  const { mutateAsync: triggerCancelOrder, isPending: isCancelOrderPending } =
    useCancelOrder();

  useEffect(() => {
    return () => {
      revokePrescriptionPreviewUrls(activeOrderPrescriptionFiles);
    };
  }, [activeOrderPrescriptionFiles]);

  const openOrderDetailsWith = (order) => {
    // console.log(order)
    const nextOrderUid = String(order?.id || '').trim();

    if (!nextOrderUid) {
      ToastNotification(
        'error',
        'Unable to load order details for this order.'
      );
      return;
    }

    setSelectedOrderDetails(normalizeOrderForDetails(order));
    setSelectedOrderUid(nextOrderUid);
    setOpenOrderDetails(true);

    setIsPrescriptionLoading(true);

    loadOrderPrescriptionFiles(nextOrderUid)
      .then((files) => {
        setActiveOrderPrescriptionFiles(Array.isArray(files) ? files : []);
      })
      .catch(() => {
        setActiveOrderPrescriptionFiles([]);
      })
      .finally(() => {
        setIsPrescriptionLoading(false);
      });
  };

  const {
    // data: test,
    isLoading: isOrderDetailLoading,
    error: orderDetailError,
    refetch: refetchOrderDetail,
  } = useOrderDetail(selectedOrderUid, {
    enabled: false,
  });

  useEffect(() => {
    let isActive = true;

    if (!openOrderDetails || !selectedOrderUid) {
      return undefined;
    }

    const refreshOrderDetail = async () => {
      const result = await refetchOrderDetail();

      if (!isActive) {
        return;
      }

      if (result.data?.order) {
        // console.log("refetch order details ", result.data?.order);

        setSelectedOrderDetails(normalizeOrderForDetails(result.data.order));
        return;
      }

      if (result.error) {
        setSelectedOrderDetails(null);
      }
    };

    refreshOrderDetail();

    return () => {
      isActive = false;
    };
  }, [openOrderDetails, selectedOrderUid]);

  const activeOrderDetails = selectedOrderDetails;
  // console.log(activeOrderDetails);
  const orderReviews = activeOrderDetails?.reviews || []
  const alreadyHasReview = Boolean(orderReviews?.length);
  const deliveryRating = Number(orderReviews[0]?.deliveryRating);
  const hasOrderDetails = Boolean(activeOrderDetails);
  const activeOrderTrxUid = String(activeOrderDetails?.trxUid || '').trim();

  const { data: returnOverviewData, isLoading: isReturnOverviewLoading } =
    useReturnOverview(activeOrderTrxUid, {
      enabled: openOrderDetails && Boolean(activeOrderTrxUid),
    });

  useEffect(() => {
    const orderId = activeOrderDetails?.orderId;
    if (!orderId) return;

    const latestStatus = returnOverviewData?.latestReturnStatus;

    setReturnStatusMap((prev) => {
      const next = { ...prev };

      if (latestStatus) {
        next[orderId] = latestStatus;
      } else {
        delete next[orderId];
      }

      return next;
    });
  }, [activeOrderDetails?.orderId, returnOverviewData?.latestReturnStatus]);

  const getReturnBadgeConfig = (orderId) => {
    const status = returnStatusMap[orderId];
    return status ? getStatusMeta(status).label : null;
  };

  const handleReturnRequestsChange = (orderId, requests = []) => {
    const latestStatus =
      Array.isArray(requests) && requests.length > 0
        ? requests[0]?.status
        : null;

    setReturnStatusMap((prev) => {
      const next = { ...prev };
      if (latestStatus) {
        next[orderId] = latestStatus;
      } else {
        delete next[orderId];
      }
      return next;
    });
  };

  const {
    data: ordersData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    refetch: refetchOrders,
  } = useInfiniteMyOrders({
    limit: ORDERS_PER_PAGE,
  });

  const apiOrders = (() => {
    const pages = ordersData?.pages ?? [];
    const seen = new Set();
    const flat = [];

    for (const page of pages) {
      const orders = Array.isArray(page?.orders) ? page.orders : [];
      for (const order of orders) {
        const key = order?.id;
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        flat.push(order);
      }
    }

    return flat;
  })();

  const totalOrderCount = (() => {
    const pages = ordersData?.pages ?? [];
    const lastPage = pages[pages.length - 1];
    return Number(lastPage?.meta?.total || apiOrders.length);
  })();

  const hasOrders = apiOrders.length > 0;

  const handleHelpClick = (event) => {
    event.preventDefault();
    // setHelpModal(true);
    const mailtoLink = `mailto:healthcare@sdlindia.com?subject=Issue with Order #${selectedOrderDetails?.orderId}`;
    window.location.href = mailtoLink;
    // window.open(mailtoLink, '_blank');
  };

  const handleReturnClick = (event) => {
    event.preventDefault();
    if (!selectedOrderDetails) {
      ToastNotification('info', 'Please select an order first');
      return;
    }
    setReturnOrderModal(true);
  };

  const handleTrackOrderClick = (event) => {
    event.preventDefault();
    const trackingSection = document.getElementById('order-tracking');
    if (trackingSection) {
      trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadInvoiceClick = (event, invoiceLink, invoiceNo) => {
    event.preventDefault();
    if (!invoiceLink) return;
    const link = document.createElement('a');
    link.href = invoiceLink;
    link.target = '_blank';
    link.download = invoiceNo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // console.log("invoiceLink ", invoiceLink);
  }

  const handleCloseOrderDetails = () => {
    if (isCancelOrderPending) return;
    setOpenOrderDetails(false);
  };

  const handleCancelOrderClick = (event) => {
    event.preventDefault();
    if (isCancelOrderPending) return;
    setCancelOrderModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (isCancelOrderPending) return;

    const trxUid = String(activeOrderDetails?.trxUid || '').trim();

    if (!trxUid) {
      ToastNotification('info', 'Cancel order is unavailable for this order.');
      setCancelOrderModal(false);
      return;
    }

    try {
      const response = await triggerCancelOrder({ trxUid });
      ToastNotification(
        'success',
        response?.message || 'Order cancelled successfully.'
      );

      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      await queryClient.invalidateQueries({
        queryKey: ['order-detail', selectedOrderUid],
      });

      setCancelOrderModal(false);
      setOpenOrderDetails(false);
      setSelectedOrderDetails(null);
      setSelectedOrderUid('');
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Unable to cancel order right now.'
      );
    }
  };

  const handleRateOrderClick = (event, order = null) => {
    event.preventDefault();

    const orderForRating = order || activeOrderDetails || null;
    const isDeliveredOrder = canReviewOrder(
      orderForRating?.status || orderForRating?.currentStatus
    );
    const hasExistingReview = Boolean(orderForRating?.reviews?.length);

    if (!isDeliveredOrder) {
      ToastNotification(
        'info',
        'You can rate an order only after it is delivered.'
      );
      return;
    }

    if (hasExistingReview) {
      ToastNotification('info', 'You can rate an order only once.');
      return;
    }

    setSelectedOrderForRating(orderForRating);

    setRateOrderModal(true);
  };

  const handleRateOrderSubmit = async (reviewData) => {
    setRateOrderModal(false);
    // TODO: API call to submit review
  };

  const handleOpenOrderedProduct = async (item) => {
    const variantUid = String(item?.variantUid || item?.variantId || '').trim();

    if (!variantUid) {
      ToastNotification('info', 'Product link is unavailable for this item.');
      return;
    }

    try {
      setRedirectingVariantUid(variantUid);
      const { productSlug, variantSlug } =
        await resolveProductRedirectByVariant(variantUid);

      const nextUrl = variantSlug
        ? `/products/${encodeURIComponent(productSlug)}?productVariant=${encodeURIComponent(variantSlug)}`
        : `/products/${encodeURIComponent(productSlug)}`;

      router.push(nextUrl);
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Unable to open this product right now.'
      );
    } finally {
      setRedirectingVariantUid('');
    }
  };

  const handleOrderAgainClick = async (order = null) => {
    const isClickEvent =
      order &&
      typeof order === 'object' &&
      typeof order.preventDefault === 'function';
    const orderTarget = isClickEvent
      ? activeOrderDetails || null
      : order || activeOrderDetails || null;
    const trxUid = String(orderTarget?.trxUid || '').trim();

    if (!trxUid) {
      ToastNotification('info', 'Order again is unavailable for this order.');
      return;
    }

    try {
      const response = await triggerOrderAgain({ trxUid });
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      ToastNotification(
        'success',
        response?.message || 'Items added to cart successfully.'
      );
      if (typeof openCartCanvas === 'function') {
        openCartCanvas();
      }
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Unable to process order again right now.'
      );
    }
  };

  const eligibleProductsForReturn = useMemo(() => {
    return Array.isArray(returnOverviewData?.eligibleProducts)
      ? returnOverviewData.eligibleProducts
      : [];
  }, [returnOverviewData]);

  const returnOrderData = useMemo(() => {
    if (!activeOrderDetails) return null;

    return {
      ...activeOrderDetails,
      items: eligibleProductsForReturn.map((item) => ({
        id: item?.id,
        orderItemUid: item?.orderItemUid,
        variantUid: item?.variantUid,
        name: item?.name,
        image: item?.image,
        variant: item?.variant,
        price: Number(item?.price || 0),
        mrp: Number(item?.mrp || 0),
        orderedQty: Number(item?.orderedQty || 0),
        alreadyReturnedQty: Number(item?.alreadyReturnedQty || 0),
        remainingQty: Number(item?.remainingQty || 0),
        fullyReturned: Boolean(item?.fullyReturned),
        inReturn: Boolean(item?.inReturn),
        unitRefund: Number(item?.unitRefund || 0),
        currentStatus: item?.currentStatus,
      })),
      returnRequests: Array.isArray(returnOverviewData?.returnRequests)
        ? returnOverviewData.returnRequests
        : [],
    };
  }, [activeOrderDetails, eligibleProductsForReturn, returnOverviewData]);

  const isOrderDetailsLoading =
    openOrderDetails && Boolean(selectedOrderUid) && isOrderDetailLoading;
  const isActiveOrderDelivered = canReturnOrder(
    activeOrderDetails?.displayStatus
  );
  // const isActiveOrderCancelable = canCancelOrder(activeOrderDetails?.displayStatus);
  const isActiveOrderCancelable = activeOrderDetails?.isCancellable;
  const canRaiseReturn = activeOrderDetails?.canRaiseReturn;
  const isActiveOrderRateable =
    canReviewOrder(activeOrderDetails?.displayStatus) && !alreadyHasReview;
  const isDelivered = activeOrderDetails?.displayStatus === 'Delivered';

  const reviewMedias = useMemo(() => {
    if (!orderReviews || !orderReviews.length) return [];
    const medias = [];
    orderReviews.forEach(review => {
      if (review.itemReviews) {
        review.itemReviews.forEach(itemRev => {
          if (itemRev.medias && itemRev.medias.length > 0) {
            medias.push(...itemRev.medias);
          }
        });
      }
    });
    return medias;
  }, [activeOrderDetails]);

  const handlePrevReviewMedia = (e) => {
    e.stopPropagation();
    if (!reviewMedias || reviewMedias.length === 0) return;
    const newIndex = reviewPreviewModal.index > 0 ? reviewPreviewModal.index - 1 : reviewMedias.length - 1;
    setReviewPreviewModal({ ...reviewPreviewModal, file: reviewMedias[newIndex], index: newIndex });
  };

  const handleNextReviewMedia = (e) => {
    e.stopPropagation();
    if (!reviewMedias || reviewMedias.length === 0) return;
    const newIndex = reviewPreviewModal.index < reviewMedias.length - 1 ? reviewPreviewModal.index + 1 : 0;
    setReviewPreviewModal({ ...reviewPreviewModal, file: reviewMedias[newIndex], index: newIndex });
  };

  return (
    <>
      {/* <AccountHeading title="My Orders" /> */}
      <div className="total-box mt-0">
        <div className="wallet-table mt-0">
          {isError ? (
            <NoDataFound
              data={{
                customClass: 'no-data-added',
                imageUrl: emptyImage,
                title: 'Something went wrong.',
                description:
                  error?.message || 'Failed to load orders. Please try again.',
                height: 220,
                width: 220,
              }}
            />
          ) : isLoading || hasOrders ? (
            <ApiOrdersList
              orders={apiOrders}
              totalOrderCount={totalOrderCount}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              handleTrackOrderClick={handleTrackOrderClick}
              getReturnBadgeConfig={getReturnBadgeConfig}
              onOpenOrderDetails={openOrderDetailsWith}
              onRateOrderClick={handleRateOrderClick}
              onOrderAgainClick={handleOrderAgainClick}
              isOrderAgainPending={isOrderAgainPending}
              formatPlacedAt={formatPlacedAt}
            />
          ) : (
            <div>
              <NoDataFound
                data={{
                  customClass: 'no-data-added',
                  imageUrl: emptyImage,
                  title: 'No Orders Yet',
                  description:
                    `You haven't placed any orders yet. Explore our products and place your first order.`,
                  height: 220,
                  width: 220,
                }}
              />
              <div className="d-flex justify-content-center mt-3">
                <Btn
                  color="primary"
                  className="btn-sm"
                  title={'Explore Products'}
                  onClick={() => router.push('/collections')}
                />
              </div>
            </div>
          )}

          {openOrderDetails && (
            <Offcanvas
              direction="end"
              isOpen={openOrderDetails}
              className={`order-details-offcanvas ${isOrderDetailsLoading ? 'is-updating' : ''}`}
              aria-busy={isOrderDetailsLoading}
              backdrop="static"
              keyboard={!isCancelOrderPending}
            >
              <OffcanvasHeader toggle={null}>
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <span className="header-text">
                    <h5 className="id">
                      {activeOrderDetails?.orderId
                        ? `Order #${activeOrderDetails.orderId}`
                        : 'Order Details'}
                    </h5>
                    {hasOrderDetails && (
                      <span className="item-count">
                        {activeOrderDetails?.items?.length || 0} items
                      </span>
                    )}
                  </span>
                </div>
                {canRaiseReturn && (
                  <button
                    type="button"
                    className="pill"
                    onClick={handleReturnClick}
                  >
                    <IoMdRefresh className="icon stroke-w-1" />
                    <span>Return</span>
                  </button>
                )}
                <button
                  type="button"
                  className="close-btn"
                  onClick={handleCloseOrderDetails}
                  disabled={isCancelOrderPending}
                  aria-label="Close"
                >
                  <RiCloseFill />
                </button>
              </OffcanvasHeader>
              <div className="cart-content-shell">
                <OffcanvasBody
                  className="cart-body order-details-body"
                  data-lenis-prevent
                >
                  <div className="order-details-content">
                    {isOrderDetailsLoading ? (
                      <OrderDetailsOffcanvasSkeleton />
                    ) : !hasOrderDetails ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 'stretch',
                        }}
                        className="alert"
                      >
                        {orderDetailError?.message ||
                          'Order details are unavailable right now.'}
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center gap-1 order-status-container">
                          <div className="order-status">
                            <span className="status-icon" style={{ lineHeight: 1 }}>
                              {(() => {
                                const { icon: StatusIcon, color } = getStatusMeta(activeOrderDetails?.displayStatus);
                                return <StatusIcon style={{ color }} />;
                              })()}
                            </span>
                            <div className="">
                              <div className="status-text">
                                {
                                  getStatusMeta(
                                    activeOrderDetails?.displayStatus
                                  ).label
                                }
                              </div>
                              {deliveryRating > 0 && (
                                <span className="order-rating">{`You rated this order ${deliveryRating} ⭐`}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            {!isDelivered ? (
                              <button
                                type="button"
                                onClick={handleTrackOrderClick}
                                className="btn-tracking"
                                disabled={isCancelOrderPending}
                              >
                                <CgTrack /> Track Order
                              </button>
                            ) : (
                              <a
                                className="btn-tracking"
                                // onClick={(e) => {
                                //   e.preventDefault();
                                //   handleDownloadInvoiceClick?.(e, activeOrderDetails?.invoiceLink, activeOrderDetails?.invoiceNo);
                                // }}
                                href={activeOrderDetails?.invoiceLink}
                                target="_blank"
                                download={activeOrderDetails?.invoiceNo}
                              >
                                <RiDownload2Line className="stroke-w-1" /> Invoice
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="order-count-and-actions">
                          <h6 className="order-count mb-0">
                            {activeOrderDetails?.items?.length || 0} items in
                            order
                          </h6>
                          {isActiveOrderCancelable && (
                            <button
                              type="button"
                              onClick={handleCancelOrderClick}
                              className="btn-tracking btn-tracking-danger"
                              disabled={isCancelOrderPending}
                            >
                              {isCancelOrderPending ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                  />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <RxCube /> Cancel Order
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <OrderDetailsItemsList
                          items={activeOrderDetails?.items || []}
                          orderId={activeOrderDetails?.orderId}
                          currentOrderStatus={activeOrderDetails?.displayStatus}
                          onOpenProduct={handleOpenOrderedProduct}
                          isResolvingProductRedirect={
                            isResolvingProductRedirect
                          }
                          redirectingVariantUid={redirectingVariantUid}
                        />

                        {/* Order Summary Section */}
                        <OrderSummary summary={activeOrderDetails?.summary} />

                        {/* Order Details Section */}
                        <OrderDetails
                          order={{
                            orderId: activeOrderDetails?.orderId,
                            receiverName: activeOrderDetails?.receiverName,
                            receiverPhone: activeOrderDetails?.receiverPhone,
                            deliveryAddress:
                              activeOrderDetails?.deliveryAddress,
                            placedAt: activeOrderDetails?.placedAt,
                            arrivedAt: activeOrderDetails?.arrivedAt,
                          }}
                          prescriptions={
                            (activeOrderDetails?.prescriptions || []).length > 0
                              ? activeOrderDetails?.prescriptions
                              : activeOrderPrescriptionFiles
                          }
                          isPrescriptionLoading={isPrescriptionLoading}
                          onHelpClick={handleHelpClick}
                        />

                        {reviewMedias.length > 0 && (
                          <div className="order-details-section order-summary-section">
                            <h4 className="section-title">Review Photos & Videos</h4>
                            <div className="prescription-detail">
                              <div className="prescription-gallery" style={{ marginTop: '12px' }}>
                                {reviewMedias.map((media, index) => (
                                  <button
                                    type="button"
                                    className="prescription-thumb"
                                    key={media.uid || index}
                                    onClick={() => setReviewPreviewModal({ open: true, file: media, index })}
                                    title={media.type === 'video' ? 'Video' : 'Image'}
                                  >
                                    {media.type === 'video' ? (
                                      <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <img src={media.url} alt="Review media" draggable={false} />
                                    )}
                                    <span className="prescription-thumb-overlay">
                                      {media.type === 'video' ? <RiVideoLine /> : <RiImage2Line />}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Refund Section */}
                        <RefundList
                          refundHistory={activeOrderDetails?.refundHistory}
                        />

                        {/* Order Tracking Section */}
                        <div
                          className="tracking-section-wrapper order-summary-section"
                          id="order-tracking"
                        >
                          <h6 className="section-title">Order Tracking</h6>
                          <OrderTracking
                            statusHistory={
                              activeOrderDetails?.tracking?.statusHistory
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </OffcanvasBody>
                <div className="cart-footer order-details-footer">
                  {isOrderDetailsLoading ? (
                    <>
                      <button className="btn-secondary" disabled>
                        Loading...
                      </button>
                      <button className="btn-primary" disabled>
                        Loading...
                      </button>
                    </>
                  ) : isCancelOrderPending ? (
                    <>
                      <button className="btn-secondary" disabled>
                        Cancelling...
                      </button>
                      <button className="btn-primary" disabled>
                        Please wait...
                      </button>
                    </>
                  ) : !hasOrderDetails ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleCloseOrderDetails}
                    >
                      Close
                    </button>
                  ) : (
                    <>
                      {isDelivered ? (
                        <>
                          <button
                            className="btn-secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              setTimeout(() => {
                                handleRateOrderClick(e, activeOrderDetails);
                              }, 200);
                            }}
                            disabled={!isActiveOrderRateable}
                          >
                            Rate Order{' '}
                            <RiStarFill
                              className="stroke-w-1"
                              color="#f5c518"
                            />
                          </button>

                          <button
                            className="btn-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              setTimeout(() => {
                                handleOrderAgainClick(activeOrderDetails);
                              }, 200);
                            }}
                            disabled={isOrderAgainPending}
                          >
                            Order Again <IoMdRefresh className="stroke-w-1" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              // Delay scroll to tracking section if needed
                              setTimeout(() => {
                                handleTrackOrderClick?.(e, activeOrderDetails);
                              }, 200);
                            }}
                          >
                            Track Order{' '}
                            <CgTrack className="stroke-w-1" color="#f5c518" />
                          </button>

                          {/* Optional: Add your alternative primary button here for non-delivered states */}
                          {/* <button
                            className="btn-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              // Example: handleSupportClick or just omit this button if not needed in details view
                            }}
                          >
                            Need Help?
                          </button> */}
                        </>
                      )}
                    </>
                  )}
                </div>
                {isOrderDetailsLoading && (
                  <div
                    className="cart-loading-overlay"
                    role="status"
                    aria-live="polite"
                  >
                    <div
                      className="spinner-border text-primary"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Loading...</span>
                  </div>
                )}
              </div>
            </Offcanvas>
          )}

          {returnOrderModal && (
            <Offcanvas
              direction="end"
              isOpen={returnOrderModal}
              className="order-details-offcanvas return-order-offcanvas"
            >
              <OffcanvasHeader toggle={null}>
                <div className="d-flex align-items-center justify-content-between w-100">
                  <span className="header-text">
                    <h5 className="id">Return Orders</h5>
                  </span>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={() => setReturnOrderModal(false)}
                    aria-label="Close"
                  >
                    <RiCloseFill />
                  </button>
                </div>
              </OffcanvasHeader>
              <div className="cart-content-shell">
                <OffcanvasBody
                  className="order-details-body"
                  data-lenis-prevent
                >
                  {/* <div className="order-details-content return-order-content"> */}
                  <ReturnOrders
                    showHeading={false}
                    orderData={returnOrderData}
                    isOverviewLoading={isReturnOverviewLoading}
                    onReturnRequestsChange={handleReturnRequestsChange}
                  />
                  {/* </div> */}
                </OffcanvasBody>
              </div>
            </Offcanvas>
          )}

          {/* {helpModal && (
            <ResponsiveModal
              modal={helpModal}
              setModal={setHelpModal}
              classes={{
                modalClass: 'theme-modal view-modal modal-md',
                modalHeaderClass: 'justify-content-between',
                modalBodyClass: 'right-sidebar-box',
                title: 'Get Help',
              }}
              backdrop="static"
            >
              <form className="auth-form" onSubmit={handleHelpSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Briefly describe the issue"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Order Number</label>
                    <input
                      type="text"
                      name="orderNumber"
                      className="form-control"
                      placeholder="e.g. QVHVHMPAH58331"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Details</label>
                    <textarea
                      name="message"
                      className="form-control"
                      rows={4}
                      placeholder="Share more details so we can help quickly"
                      required
                    />
                  </div>
                  <div className="col-12 d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setHelpModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn primary">
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </ResponsiveModal>
          )} */}

          <RateOrderModal
            isOpen={rateOrderModal}
            onClose={() => setRateOrderModal(false)}
            order={selectedOrderForRating}
            onSubmit={handleRateOrderSubmit}
          />

          <ResponsiveModal
            modal={reviewPreviewModal.open}
            setModal={() => setReviewPreviewModal({ open: false, file: null })}
            closeButton={
              <button
                type="button"
                className="btn-close position-static"
                onClick={() => setReviewPreviewModal({ open: false, file: null })}
                aria-label="Close preview"
              >
                <RiCloseLine />
              </button>
            }
            extraFunction={() => setReviewPreviewModal({ open: false, file: null })}
            classes={{
              modalClass: 'theme-modal review-preview-modal',
              offcanvasClass: 'review-preview-offcanvas',
              modalHeaderClass: 'review-preview-header justify-content-between',
              modalBodyClass: 'review-preview-body',
              title: 'Media Preview',
            }}
          >
            {reviewPreviewModal.file && (
              <>
                <div className="review-preview-media-container">
                  {reviewMedias?.length > 1 && (
                    <button type="button" className="preview-nav-btn prev" onClick={handlePrevReviewMedia} aria-label="Previous">
                      <RiArrowLeftSLine />
                    </button>
                  )}
                  {reviewPreviewModal.file.type === 'video' ? (
                    <video
                      src={reviewPreviewModal.file.url}
                      controls
                      autoPlay
                      playsInline
                      style={{ width: '100%', maxHeight: '70vh' }}
                    />
                  ) : (
                    <img
                      src={reviewPreviewModal.file.url}
                      alt="Preview"
                      draggable={false}
                    />
                  )}
                  {reviewMedias?.length > 1 && (
                    <button type="button" className="preview-nav-btn next" onClick={handleNextReviewMedia} aria-label="Next">
                      <RiArrowRightSLine />
                    </button>
                  )}
                </div>
                <div className="review-preview-footer">
                  <span className="preview-file-name">
                    Review {reviewPreviewModal.file.type === 'video' ? 'Video' : 'Image'}
                  </span>
                  <span className="preview-file-meta">
                    <span className="preview-type-badge">
                      {reviewPreviewModal.file.type === 'video' ? 'VID' : 'IMG'}
                    </span>
                  </span>
                </div>
              </>
            )}
          </ResponsiveModal>

          <ConfirmationModal
            modal={cancelOrderModal}
            setModal={setCancelOrderModal}
            isLoading={isCancelOrderPending}
            confirmFunction={handleConfirmCancelOrder}
            title="Cancel Order"
            message="Are you sure you want to cancel this order? This action cannot be undone."
            cancelLabel="Keep Order"
            confirmLabel="Cancel Order"
          />

          <PageActionOverlay
            isOpen={isOrderAgainPending}
          // title="Updating your cart"
          // description="We are adding the items from this order back into your cart."
          />
        </div>
      </div>
    </>
  );
};

export default MyOrders;
