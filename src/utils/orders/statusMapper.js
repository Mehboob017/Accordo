import {
  RiArchiveLine,
  RiBox3Line,
  RiCloseCircleLine,
  RiLoader4Line,
  RiMapPinLine,
  RiMoneyRupeeCircleLine,
  RiShoppingBag3Line,
  RiTimeLine,
  RiTruckLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';

const STATUS_CONFIG = {
  // ---------------- ORDER ----------------

  pending: {
    key: 'PENDING',
    label: 'Pending',
    icon: RiTimeLine,
    className: 'pending',
  },

  placed: {
    key: 'PLACED',
    label: 'Placed',
    icon: RiShoppingBag3Line,
    className: 'placed',
  },

  confirmed: {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: RiCheckboxCircleLine,
    className: 'confirmed',
  },

  processing: {
    key: 'PROCESSING',
    label: 'Processing',
    icon: RiLoader4Line,
    className: 'processing',
  },

  packed: {
    key: 'PACKED',
    label: 'Packed',
    icon: RiBox3Line,
    className: 'packed',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  shipment_created: {
    key: 'SHIPMENT_CREATED',
    label: 'Shipment Created',
    icon: RiBox3Line,
    className: 'confirmed',
  },

  shipped: {
    key: 'SHIPPED',
    label: 'Shipped',
    icon: RiTruckLine,
    className: 'shipping',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  in_transit: {
    key: 'IN_TRANSIT',
    label: 'In Transit',
    icon: RiTruckLine,
    className: 'shipping',
  },

  out_for_delivery: {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out For Delivery',
    icon: RiMapPinLine,
    className: 'shipping',
  },

  delivery_attempt_failed: {
    key: 'DELIVERY_ATTEMPT_FAILED',
    label: 'Delivery Attempt Failed',
    icon: RiCloseCircleLine,
    className: 'warning',
  },

  onway: {
    key: 'ONWAY',
    label: 'On The Way',
    icon: RiTruckLine,
    className: 'shipping',
  },

  delivered: {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: RiCheckboxCircleLine,
    className: 'success',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  undelivered: {
    key: 'UNDELIVERED',
    label: 'Delivery Attempt Failed',
    icon: RiCloseCircleLine,
    className: 'warning',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  reattempt_requested: {
    key: 'REATTEMPT_REQUESTED',
    label: 'Delivery Reattempt Scheduled',
    icon: RiTimeLine,
    className: 'warning',
  },

  // NEW: From ORDER_STATUS_DISPLAY (RTO Statuses)
  rto_initiated: {
    key: 'RTO_INITIATED',
    label: 'Return to Origin',
    icon: RiArchiveLine,
    className: 'danger',
  },
  rto_in_transit: {
    key: 'RTO_IN_TRANSIT',
    label: 'RTO In Transit',
    icon: RiTruckLine,
    className: 'danger',
  },
  rto_out_for_delivery: {
    key: 'RTO_OUT_FOR_DELIVERY',
    label: 'RTO Out for Delivery',
    icon: RiMapPinLine,
    className: 'danger',
  },
  rto_undelivered: {
    key: 'RTO_UNDELIVERED',
    label: 'RTO Undelivered',
    icon: RiCloseCircleLine,
    className: 'danger',
  },
  rto_delivered: {
    key: 'RTO_DELIVERED',
    label: 'RTO Delivered',
    icon: RiCheckboxCircleLine,
    className: 'danger',
  },

  completed: {
    key: 'COMPLETED',
    label: 'Completed',
    icon: RiCheckboxCircleLine,
    className: 'success',
  },

  cancelled: {
    key: 'CANCELLED',
    label: 'Cancelled',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  shipment_cancelled: {
    key: 'SHIPMENT_CANCELLED',
    label: 'Shipment Cancelled',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  partially_cancelled: {
    key: 'PARTIALLY_CANCELLED',
    label: 'Partially Cancelled',
    icon: RiCloseCircleLine,
    className: 'warning',
  },

  failed: {
    key: 'FAILED',
    label: 'Failed',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  lost: {
    key: 'LOST',
    label: 'Lost in Transit',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  // NEW: From ORDER_STATUS_DISPLAY
  damaged: {
    key: 'DAMAGED',
    label: 'Damaged',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  refund_initiated: {
    key: 'REFUND_INITIATED',
    label: 'Refund Initiated',
    icon: RiMoneyRupeeCircleLine,
    className: 'warning',
  },

  refund_created: {
    key: 'REFUND_CREATED',
    label: 'Refund Created',
    icon: RiMoneyRupeeCircleLine,
    className: 'processing',
  },

  refund_processed: {
    key: 'REFUND_PROCESSED',
    label: 'Refund Processed',
    icon: RiMoneyRupeeCircleLine,
    className: 'processing',
  },

  // ---------------- RETURNS ----------------

  requested: {
    key: 'REQUESTED',
    label: 'Requested',
    icon: RiTimeLine,
    className: 'warning',
  },

  return_requested: {
    key: 'RETURN_REQUESTED',
    label: 'Return Requested',
    icon: RiTimeLine,
    className: 'warning',
  },

  approved: {
    key: 'APPROVED',
    label: 'Approved',
    icon: RiCheckboxCircleLine,
    className: 'confirmed',
  },

  return_approved: {
    key: 'RETURN_APPROVED',
    label: 'Return Approved',
    icon: RiCheckboxCircleLine,
    className: 'confirmed',
  },

  pickup_scheduled: {
    key: 'PICKUP_SCHEDULED',
    label: 'Pickup Scheduled',
    icon: RiTimeLine,
    className: 'shipping',
  },

  picked_up: {
    key: 'PICKED_UP',
    label: 'Picked Up',
    icon: RiTruckLine,
    className: 'shipping',
  },

  // NEW: From RETURN_STATUS_DISPLAY
  return_picked_up: {
    key: 'RETURN_PICKED_UP',
    label: 'Return Picked Up',
    icon: RiTruckLine,
    className: 'shipping',
  },

  // NEW: From RETURN_STATUS_DISPLAY
  return_in_transit: {
    key: 'RETURN_IN_TRANSIT',
    label: 'Return In Transit',
    icon: RiTruckLine,
    className: 'shipping',
  },

  // NEW: From RETURN_STATUS_DISPLAY
  return_received: {
    key: 'RETURN_RECEIVED',
    label: 'Return Received at Warehouse',
    icon: RiArchiveLine,
    className: 'processing',
  },

  quality_check: {
    key: 'QUALITY_CHECK',
    label: 'Quality Check',
    icon: RiLoader4Line,
    className: 'processing',
  },

  refunded: {
    key: 'REFUNDED',
    label: 'Refunded',
    icon: RiMoneyRupeeCircleLine,
    className: 'refunded',
  },

  refund_completed: {
    key: 'REFUNDED_COMPLETED',
    label: 'Refunded Completed',
    icon: RiMoneyRupeeCircleLine,
    className: 'refunded',
  },

  // NEW: From RETURN_STATUS_DISPLAY
  closed: {
    key: 'CLOSED',
    label: 'Return Completed',
    icon: RiCheckboxCircleLine,
    className: 'success',
  },

  rejected: {
    key: 'REJECTED',
    label: 'Rejected',
    icon: RiCloseCircleLine,
    className: 'danger',
  },

  // NEW: From RETURN_STATUS_DISPLAY
  pickup_cancelled: {
    key: 'PICKUP_CANCELLED',
    label: 'Pickup Cancelled',
    icon: RiCloseCircleLine,
    className: 'warning',
  },

  partial_refund: {
    key: 'PARTIAL_REFUND',
    label: 'Partial Refund',
    icon: RiMoneyRupeeCircleLine,
    className: 'warning',
  },
};

const toStatusToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const toStatusLabel = (value) => {
  const token = toStatusToken(value);

  return token
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const STATUS_COLORS = {
  pending: '#1fa67a',
  placed: '#1fa67a',
  confirmed: '#1fa67a',
  processing: '#1fa67a',
  packed: '#1fa67a',
  shipping: '#1fa67a',
  success: '#1fa67a',
  warning: '#d97706',
  danger: '#dc3545',
  refunded: '#1fa67a',
  default: 'var(--theme-color)',
};

const STATUS_BG_COLORS = {
  pending: '#c8ffedff',
  placed: '#c8ffedff',
  confirmed: '#c8ffedff',
  processing: '#c8ffedff',
  packed: '#c8ffedff',
  shipping: '#c8ffedff',
  success: '#c8ffedff',
  warning: '#fef3c7',
  danger: '#fee2e2',
  refunded: '#d1fae5',
  default: 'rgba(13, 164, 135, 0.12)',
};

export const getStatusMeta = (value) => {

  const token = toStatusToken(value);
  const config = STATUS_CONFIG[token];
  const className = config?.className || 'default';

  return {
    raw: value,
    token,
    key: config?.key || token.toUpperCase() || 'UNKNOWN',
    label: config?.label || toStatusLabel(value),
    icon: config?.icon || RiCheckboxCircleLine,
    className,
    color: STATUS_COLORS[className] || STATUS_COLORS.default,
    bgColor: STATUS_BG_COLORS[className] || STATUS_BG_COLORS.default,
  };
};

export const ORDER_ACTIONS = {
  return: {
    allowedStatuses: [
      'delivered',
      'completed',
    ],
    blockedStatuses: [
      'cancelled',
      'failed',
      'refunded',
      'return_requested',
      'return_approved',
      'pickup_scheduled',
      'picked_up',
      'quality_check',
    ],
  },

  cancel: {
    allowedStatuses: [
      'pending', // Allow cancelling if order is still pending (not yet processed)
      'placed', // Allow cancelling if order is placed but not yet confirmed
      'confirmed', // Allow cancelling if order is confirmed but not yet processed
      // 'processing', // Allow cancelling if order is being processed but not yet packed
      // 'packed', // Allow cancelling if order is packed but not yet shipped
      // 'shipped', // Allow cancelling if order is shipped but not yet out for delivery
      // 'out_for_delivery', // Allow cancelling if order is out for delivery but not yet delivered
      // 'onway', // Allow cancelling if order is on the way but not yet delivered
    ],
  },

  track: {
    allowedStatuses: [
      'shipped',
      'out_for_delivery',
      'onway',
    ],
  },

  reorder: {
    allowedStatuses: [
      'delivered',
      'completed',
      'cancelled',
      'partially_cancelled',
      'failed',
      'refunded',
    ],
  },

  review: {
    allowedStatuses: [
      'delivered',
      'completed',
    ],
  },
};

const isStatusAllowed = (
  status,
  actionConfig = {},
) => {
  const token = toStatusToken(status);

  const {
    allowedStatuses,
    blockedStatuses,
  } = actionConfig;

  if (
    blockedStatuses?.includes(token)
  ) {
    return false;
  }

  if (
    allowedStatuses?.length
  ) {
    return allowedStatuses.includes(token);
  }

  return false;
};

export const canReturnOrder = (status) =>
  isStatusAllowed(
    status,
    ORDER_ACTIONS.return
  );

export const canCancelOrder = (status) =>
  isStatusAllowed(
    status,
    ORDER_ACTIONS.cancel
  );

export const canTrackOrder = (status) =>
  isStatusAllowed(
    status,
    ORDER_ACTIONS.track
  );

export const canReorderOrder = (status) =>
  isStatusAllowed(
    status,
    ORDER_ACTIONS.reorder
  );

export const canReviewOrder = (status) =>
  isStatusAllowed(
    status,
    ORDER_ACTIONS.review
  );

// Color						                      Semantic Meaning						 ClassNames						            Example Statuses
// 🟢 Green ( #1fa67a / #d1fae5)		 Success/Completion				    confirmed, success, refunded	✅ Delivered, Completed, Refunded
// 🔵 Blue ( #2563eb / #dbeafe)		   Processing/In Transit				processing, packed, shipping	📦 Shipped, In Transit, Processing
// 🟠 Amber ( #d97706 / #fef3c7)		 Pending/Warning					    pending, warning			        ⏳ Pending, Undelivered, Waiting
// 🔴 Red ( #dc3545 / #fee2e2)		   Danger/Failed/Cancelled		  danger						            ❌ Cancelled, Failed, Lost  