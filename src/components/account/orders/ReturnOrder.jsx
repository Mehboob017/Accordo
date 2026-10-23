'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  RiCloseFill,
  RiImageAddLine,
  RiInformationLine,
  RiVideoLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import {
  FaChevronRight,
  FaCheckCircle,
  // FaTruck,
  // FaTimesCircle,
  // FaUndo,
  FaMinus,
  FaPlus,
} from 'react-icons/fa';
// import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
// import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import AccountHeading from '@/components/common/AccountHeading';
// import OrderTracking from './OrderTracking';
// import RefundStatus from './RefundStatus';
// import OrderDetails from './OrderDetails';
// import OrderSummary from './OrderSummary';
import ReturnOrderDetails from './ReturnOrderDetails';
import { uploadFileToS3 } from '@/utils/helpers';
import { createReturnRequest } from '@/api/orders.api';
import { useReturnNew, useReturnOverview } from '@/utils/hooks/useMyOrders';
import './ReturnOrder.scss';
import { getStatusMeta } from '@/utils/orders/statusMapper';
import { FiCalendar } from 'react-icons/fi';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';

// const FALLBACK_PRODUCT_IMAGE = '/assets/images/placeholder.png';

const MAX_FILES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/webm'];
const RETURN_POLICY_PDF_URL =
  '/assets/uploads/Consumer Ayurved Swamala Return Policy_c2c.pdf';
const RETURN_PROOF_UPLOAD_FOLDER = 'SDL/return-requests';

const VIEW = { CREATE: 'CREATE', OVERVIEW: 'OVERVIEW' };
const THEME_STATUS_ICON_STYLE = { color: 'var(--theme-color)' };
const THEME_STATUS_BADGE_STYLE = {
  background: 'rgba(var(--theme-color-rgb), 0.12)',
  borderColor: 'rgba(var(--theme-color-rgb), 0.22)',
  color: 'var(--theme-color)',
};

const calculateProratedCoins = (product, quantity, coinField) => {
  const orderedQty = Number(product?.orderedQty || 0);
  if (orderedQty <= 0) return 0;

  const totalCoins = Number(product?.[coinField] || 0);
  if (!Number.isFinite(totalCoins) || totalCoins <= 0) return 0;

  return (totalCoins / orderedQty) * Number(quantity || 0);
};

const buildReturnRequestPayload = ({ pickupAddressUid, items, proofFiles }) => {
  return {
    pickupAddressUid: String(pickupAddressUid || '').trim(),
    refundMethod: 'SDLINDIA Cash',
    items: (Array.isArray(items) ? items : []).map((item) => ({
      orderItemUid: String(item?.orderItemUid || '').trim(),
      quantity: Number(item?.quantity || 0),
      reason: String(item?.reason || '').trim(),
      additionalNote: String(item?.additionalNote || '').trim(),
    })),
    proofFiles: (Array.isArray(proofFiles) ? proofFiles : []).map((file) => ({
      imageKey: String(file?.imageKey || '').trim(),
      fileType: String(file?.fileType || '').trim(),
      fileName: String(file?.fileName || '').trim(),
      fileSize: Number(file?.fileSize || 0),
    })),
  };
};

const formatReturnDate = (lastReturnDate) => {
  if (!lastReturnDate) return null;
  const date = new Date(lastReturnDate);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ReturnRequestsList = ({ returnRequests, onViewRequestDetails }) => {
  if (!returnRequests.length) return null;

  // if (returnRequests.length === 0) {
  //   return (
  //     <div className="return-section no-returns">
  //       <p>No return requests yet.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="return-section">
      <h6 className="section-title">Return Requests</h6>
      <div className="return-requests-list">
        {returnRequests.map((req) => {
          const primaryProduct = req?.products?.[0] || {};
          const extraProductsCount = Math.max(
            (req?.products?.length || 0) - 1,
            0
          );
          const hasProductRow = Boolean(
            primaryProduct?.image ||
            primaryProduct?.name ||
            primaryProduct?.variant ||
            extraProductsCount > 0
          );
          const hasRefundAmount =
            req?.refundAmount !== null && req?.refundAmount !== undefined;

          return (
            <div
              key={req.id}
              className="order-card return-request-card"
              onClick={() => onViewRequestDetails(req)}
            >
              <div className="return-request-top-row">
                <div className="return-request-heading">
                  {req.id && <span className="return-request-id">{req.id}</span>}
                  <span className="return-request-status-icon" aria-hidden="true" style={{ lineHeight: 1 }}>
                    {(() => {
                      const { icon: StatusIcon, color } = getStatusMeta(req.status);
                      return <StatusIcon style={{ color }} />;
                    })()}
                  </span>
                </div>
                <div className="return-request-actions">
                  {hasRefundAmount && (
                    <span className="return-request-price">
                      ₹{Number(req.refundAmount).toFixed(2)}
                    </span>
                  )}
                  <span className="menu-btn">
                    <FaChevronRight size={10} />
                  </span>
                </div>
              </div>

              {req.status && (
                <div className="refund-badge-wrapper">
                  <span className="refund-badge" style={THEME_STATUS_BADGE_STYLE}>
                    {getStatusMeta(req.status).label}
                  </span>
                </div>
              )}

              {req.submittedDate && (
                <p className="meta return-request-submitted">
                  <FiCalendar /> Submitted: {req.submittedDate}
                </p>
              )}

              {hasProductRow && (
                <div className="return-request-product-row">
                  {primaryProduct.image && (
                    <div className="return-request-product-image">
                      <Image
                        src={primaryProduct.image}
                        alt={primaryProduct.name || ''}
                        width={56}
                        height={56}
                        draggable={false}
                        className="image"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="return-request-product-copy">
                    {primaryProduct.name && (
                      <span className="return-request-product-name">
                        {primaryProduct.name}
                      </span>
                    )}
                    {primaryProduct.variant && (
                      <span className="return-request-product-variant">
                        {primaryProduct.variant}
                      </span>
                    )}
                    {extraProductsCount > 0 && (
                      <span className="return-request-product-extra">
                        +{extraProductsCount} more{' '}
                        {extraProductsCount > 1 ? 'items' : 'item'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {req.reason && (
                <div className="return-request-meta">
                  <span className="meta-label">Reason:</span>
                  <span className="meta-value">{req.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AvailableProductsList = ({ products, cumulativeReturned }) => {
  return (
    <div className="return-section product-split-section">
      <h6 className="section-title">Products Available for Return</h6>
      {products.length > 0 ? (
        <ul className="return-product-list compact">
          {products.map((p) => {
            const returned = cumulativeReturned[p.id] || 0;
            const remaining = p.orderedQty - returned;

            return (
              <li key={p.id} className="return-product-item compact">
                <div className="product-thumb">
                  <Image
                    src={p.image || ''}
                    alt={p.name}
                    width={40}
                    height={40}
                    draggable={false}
                    unoptimized
                  />
                </div>
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-variant">
                    {remaining} of {p.orderedQty} remaining
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="section-subtitle mb-0">
          No products available for return.
        </p>
      )}
    </div>
  );
};

const NonReturnableProductsList = ({ products, maxReturnable }) => {
  const getBadgeLabel = (product) => {
    if (product?.inReturn) return 'In return process';
    if (product?.fullyReturned || maxReturnable(product.id) <= 0)
      return 'All items returned';
    return 'Not eligible for return';
  };

  if (!products.length) return null;

  return (
    <div className="return-section product-split-section">
      <h6 className="section-title">Returned / In-Return / Not Eligible</h6>
      {products.length > 0 ? (
        <ul className="return-product-list compact disabled">
          {products.map((p) => (
            <li key={p.id} className="return-product-item compact">
              <div className="product-thumb">
                <Image
                  src={p.image || ''}
                  alt={p.name}
                  width={40}
                  height={40}
                  draggable={false}
                  unoptimized
                />
              </div>
              <div className="product-info">
                <span className="product-name">{p.name}</span>
                <span className="badge-returned">{getBadgeLabel(p)}</span>
                {p.lastReturnDate && (
                  <span className="product-variant">
                    Last return date: {formatReturnDate(p.lastReturnDate)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="section-subtitle mb-0">
          No returned or non-eligible products for this order.
        </p>
      )}
    </div>
  );
};

const NewReturnFormSkeleton = () => {
  return (
    <div className="return-create-form return-create-skeleton">
      <div className="return-section">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
      <div className="return-section">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-card large" />
      </div>
    </div>
  );
};

const NewReturnForm = ({
  orderData,
  products,
  selectedProducts,
  selectedCount,
  cumulativeReturned,
  returnQty,
  returnReasons,
  returnNotes,
  returnImages,
  uploadErrors,
  reasonErrors,
  reasonOptions,
  isSubmitting,
  order,
  estimatedRefund,
  estimatedCoinSummary,
  maxReturnable,
  getReturnReasonLabel,
  onSelectProduct,
  onQtyChange,
  onOpenReturnPolicyPdf,
  onReasonChange,
  onNoteChange,
  onImageUpload,
  onRemoveImage,
}) => {
  const matchesReturnCriteria = (product) => {
    return Boolean(product?.eligible) && !Boolean(product?.isFreeGift);
  };

  const createTabProductsByCriteria = products.filter(matchesReturnCriteria);
  const createTabReturnableProducts = createTabProductsByCriteria.filter(
    (product) => {
      return maxReturnable(product.id) > 0 && !product?.fullyReturned;
    }
  );

  const createTabNonSelectableProducts = createTabProductsByCriteria.filter(
    (product) => {
      return !createTabReturnableProducts.some(
        (item) => item.id === product.id
      );
    }
  );

  return (
    <div className="return-create-form">
      {/* IF NO ORDER DATA */}
      {!orderData && (
        <div className="no-returns mb-3">
          <p>Select an order to create a return request.</p>
        </div>
      )}

      {/* SELECT PRODUCT TO RETURN */}
      <div className="return-section">
        <h6 className="section-title">Select Product to Return</h6>
        <p className="section-subtitle">
          Choose one product and set quantity for return.
        </p>
        <ul className="return-product-list">
          {createTabReturnableProducts.map((product) => {
            const maxQty = maxReturnable(product.id);
            const isSelected = !!selectedProducts[product.id];
            const alreadyReturned = cumulativeReturned[product.id] || 0;

            return (
              <li
                key={product.id}
                className={`return-product-item ${isSelected ? 'selected' : ''}`}
              >
                <label className="product-checkbox-label">
                  <input
                    type="radio"
                    name="selected-return-product"
                    checked={isSelected}
                    onChange={() => onSelectProduct(product.id)}
                    className="product-checkbox"
                    disabled={isSubmitting}
                  />
                  <div className="product-thumb">
                    <Image
                      src={product.image || ''}
                      alt={product.name}
                      width={56}
                      height={56}
                      draggable={false}
                      unoptimized
                    />
                  </div>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-variant">{product.variant}</span>
                    <div className="product-price-row">
                      <span className="product-price">
                        ₹{product.payableAmount.toFixed(2)}
                      </span>
                      {product.mrp > product.price && (
                        <del className="product-mrp">
                          ₹{(product.mrp * product.orderedQty).toFixed(2)}
                        </del>
                      )}
                    </div>
                    <span className="product-ordered-qty">
                      Ordered: {product.orderedQty}
                      {alreadyReturned > 0 && (
                        <span className="already-returned">
                          {' '}
                          · {alreadyReturned} already returned
                        </span>
                      )}
                    </span>
                  </div>
                </label>

                {isSelected && (
                  <div className="qty-selector">
                    <span className="qty-label">Return Qty</span>
                    <div className="qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        disabled={
                          isSubmitting || (returnQty[product.id] || 1) <= 1
                        }
                        onClick={() => onQtyChange(product.id, -1)}
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="qty-value">
                        {returnQty[product.id] || 1}
                      </span>
                      <button
                        type="button"
                        className="qty-btn"
                        disabled={
                          isSubmitting || (returnQty[product.id] || 1) >= maxQty
                        }
                        onClick={() => onQtyChange(product.id, 1)}
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <span className="qty-max">Max: {maxQty}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {createTabNonSelectableProducts.length > 0 && (
          <div className="fully-returned-section">
            <h6 className="subsection-title">Unavailable Products</h6>
            <ul className="return-product-list disabled">
              {createTabNonSelectableProducts.map((product) => (
                <li key={product.id} className="return-product-item disabled">
                  <div className="product-thumb">
                    <Image
                      src={product.image || ''}
                      alt={product.name}
                      width={56}
                      height={56}
                      draggable={false}
                      unoptimized
                    />
                  </div>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-variant">{product.variant}</span>
                    <span className="badge-returned">
                      {product?.fullyReturned || maxReturnable(product.id) <= 0
                        ? 'All items returned'
                        : 'Not eligible for return'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RETURN DETAILS */}
      {selectedCount > 0 && (
        <div className="return-section">
          <h6 className="section-title">Return Details</h6>
          <p className="section-subtitle">
            Provide reason, note, and proof for the selected product.
          </p>

          {Object.keys(selectedProducts)
            .filter((pid) => selectedProducts[pid])
            .map((pid) => {
              const product = products.find(
                (p) => String(p.id) === String(pid)
              );
              if (!product) return null;

              const productReason = returnReasons[pid] || '';
              const productNotes = returnNotes[pid] || '';
              const productImages = returnImages[pid] || [];

              return (
                <div key={pid} className="product-return-detail-card">
                  <div className="return-product-item compact reason-product-item">
                    <div className="product-thumb">
                      <Image
                        src={product.image || ''}
                        alt={product.name}
                        width={56}
                        height={56}
                        draggable={false}
                        unoptimized
                      />
                    </div>
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-variant">{product.variant}</span>
                      <span className="product-ordered-qty">
                        Returning: {returnQty[pid] || 1}{' '}
                        {(returnQty[pid] || 1) > 1 ? 'items' : 'item'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="reason-header-row">
                      <label className="form-label mb-0">
                        Reason for Return <span className="required">*</span>
                      </label>
                      <button
                        type="button"
                        className="reason-pdf-link"
                        onClick={onOpenReturnPolicyPdf}
                      >
                        View Return Policy
                      </button>
                    </div>

                    <select
                      className="form-select"
                      value={productReason}
                      disabled={isSubmitting}
                      onChange={(e) => onReasonChange(pid, e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {reasonOptions.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>

                    {reasonErrors[pid] && (
                      <div className="upload-error-message mt-2">
                        <RiErrorWarningLine size={16} />
                        <span>{reasonErrors[pid]}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Additional Details
                      {productReason === 'other' && (
                        <span className="required"> * Required for Other</span>
                      )}
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Share more details about the issue..."
                      value={productNotes}
                      disabled={isSubmitting}
                      onChange={(e) => onNoteChange(pid, e.target.value)}
                    />
                    {productReason === 'other' && (
                      <p className="form-helper-text mt-1 mb-0">
                        Minimum 10 characters required.
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Upload Proof (Images/Videos){' '}
                      <span className="required">* Min 1 files required</span>
                    </label>
                    <p className="form-helper-text">
                      Max {MAX_FILES} files • Images: max 5MB • Videos: max 20MB
                      • {productImages.length}/{MAX_FILES} uploaded
                    </p>

                    {uploadErrors[pid] && (
                      <div className="upload-error-message">
                        <RiErrorWarningLine size={16} />
                        <span>{uploadErrors[pid]}</span>
                      </div>
                    )}

                    <div className="proof-upload-area">
                      {productImages.map((file) => (
                        <div
                          key={file.id}
                          className={`proof-thumb ${file.type}`}
                        >
                          {file.type === 'image' ? (
                            <img
                              src={file.preview}
                              alt="Proof"
                              draggable={false}
                            />
                          ) : (
                            <div className="video-preview">
                              <video src={file.preview} draggable={false} />
                              <div className="video-overlay">
                                <RiVideoLine size={24} />
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            className="remove-proof"
                            disabled={isSubmitting}
                            onClick={() => onRemoveImage(pid, file.id)}
                            aria-label="Remove file"
                          >
                            <RiCloseFill size={14} />
                          </button>
                          <div className="file-info">
                            <span className="file-type-badge">
                              {file.type === 'image' ? 'IMG' : 'VID'}
                            </span>
                            <span className="file-size">
                              {(file.size / 1024 / 1024).toFixed(2)}MB
                            </span>
                          </div>
                        </div>
                      ))}

                      {productImages.length < MAX_FILES && (
                        <button
                          type="button"
                          className="add-proof-btn"
                          disabled={isSubmitting}
                          onClick={() =>
                            document.getElementById(`file-input-${pid}`).click()
                          }
                        >
                          <RiImageAddLine size={20} />
                          <span>Add Files</span>
                          <span className="btn-helper">Images/Videos</span>
                        </button>
                      )}

                      <input
                        id={`file-input-${pid}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                        multiple
                        hidden
                        disabled={isSubmitting}
                        onChange={(e) => onImageUpload(pid, e)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ORDER INFORMATION */}
      <div className="return-section">
        <h6 className="section-title">Order Information</h6>
        <div className="return-info-grid">
          <div className="info-row">
            <span className="info-label">Order ID</span>
            <span className="info-value">#{order?.orderId || '-'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Date</span>
            <span className="info-value">{order?.orderDate || '-'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Delivery Date</span>
            <span className="info-value">{order?.deliveryDate || '-'}</span>
          </div>
          {/* <div className="info-row">
            <span className="info-label">Refund Method</span>
            <span className="info-value">SDLINDIA Cash</span>
          </div> */}
        </div>

        {order?.deliveryAddress && (
          <div className="return-address-section">
            <h6 className="subsection-title">Pickup Address</h6>
            <div className="address-card">
              <p className="address-name text-capitalize">
                {order?.receiverName}
              </p>
              {order?.receiverPhone && (
                <p className="address-phone">{order?.receiverPhone}</p>
              )}
              <p className="address-text">{order?.deliveryAddress}</p>
            </div>
          </div>
        )}

        {/* <div className="return-policy-note">
          <RiInformationLine size={16} />
          <span>
            Items are eligible for return within 7 days of delivery. Refunds are
            processed within 5-7 business days after pickup.
          </span>
        </div> */}

        {/* <div className="return-policy-note sdl-coins-disclaimer"> */}
        <div className="return-policy-note">
          <RiInformationLine size={16} />
          <span>
            <strong>SDL Points Notice:</strong> SDL Points used for this
            order will be refunded back to source.
          </span>
        </div>
      </div>

      {/* RETURN SUMMARY */}
      {selectedCount > 0 && (
        <>
          <div className="return-section return-summary-section">
            <h6 className="section-title">Return Summary</h6>
            <ul className="summary-product-list">
              {Object.keys(selectedProducts)
                .filter((pid) => selectedProducts[pid])
                .map((pid) => {
                  const p = products.find(
                    (pr) => String(pr.id) === String(pid)
                  );
                  const qty = returnQty[pid] || 1;
                  const reason = returnReasons[pid] || '';

                  if (!p) return null;

                  return (
                    <li key={pid} className="summary-product-item with-reason">
                      <div className="summary-product-thumb">
                        <Image
                          src={p.image || ''}
                          alt={p.name}
                          width={40}
                          height={40}
                          draggable={false}
                          unoptimized
                        />
                      </div>
                      <div className="summary-product-info">
                        <span className="name">{p.name}</span>
                        {p.variant && (
                          <span className="variant">{p.variant}</span>
                        )}
                        <span className="qty">Qty: {qty}</span>
                        {reason && (
                          <span className="reason-tag">
                            {getReturnReasonLabel(reason)}
                          </span>
                        )}
                      </div>
                      <span className="summary-product-price">
                        ₹{(p.unitRefund * qty).toFixed(2)}
                      </span>
                    </li>
                  );
                })}
            </ul>

            <div className="return-bill-details">
              <div className="bill-row total">
                <span>Estimated Refund</span>
                <span className="total-amount">
                  ₹{estimatedRefund.toFixed(2)}
                </span>
              </div>
              {estimatedCoinSummary.totalCoins > 0 && (
                <div className="bill-row total">
                  <span>Estimated SDL Points after completion</span>
                  <span className="total-amount">
                    {estimatedCoinSummary.totalCoins}
                  </span>
                </div>
              )}
            </div>

            {estimatedCoinSummary.totalCoins > 0 &&
              <>
                {/* <div className="return-policy-note sdl-coins-disclaimer compact"> */}
                < div className="return-policy-note compact">
                  <RiInformationLine size={14} />
                  <span>
                    SDL Points used for this order will be returned upon refund
                    completion and won&apos;t be usable until then.
                  </span>
                </div>
              </>}
          </div>
        </>
      )
      }

      {/* {selectedCount > 0 && <div className="return-fixed-spacer" />} */}
    </div >
  );
};

const ReturnOrders = ({
  showHeading = true,
  orderData = null,
  isOverviewLoading = false,
  onReturnRequestsChange,
}) => {
  const [currentView, setCurrentView] = useState(VIEW.OVERVIEW);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState({});
  const [returnQty, setReturnQty] = useState({});
  const [returnReasons, setReturnReasons] = useState({});
  const [returnNotes, setReturnNotes] = useState({});
  const [returnImages, setReturnImages] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [reasonErrors, setReasonErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const trxUid = String(orderData?.trxUid || '').trim();
  const onReturnRequestsChangeRef = useRef(onReturnRequestsChange);

  const { data: returnOverviewData, isLoading: isOverviewTabLoading } =
    useReturnOverview(trxUid, {
      enabled: Boolean(trxUid),
    });

  const { data: returnNewData, isLoading: isNewReturnLoading } = useReturnNew(
    trxUid,
    {
      enabled: Boolean(trxUid),
    }
  );

  const reasonOptions = useMemo(() => {
    const options = Array.isArray(returnNewData?.returnReasons)
      ? returnNewData.returnReasons
      : [];
    return options.length > 0 ? options : [];
  }, [returnNewData?.returnReasons]);

  const getReturnReasonLabel = (reasonValue) => {
    const match = reasonOptions.find((reason) => reason.value === reasonValue);
    return match?.label || reasonValue;
  };

  const products = useMemo(() => {
    const sourceItems = Array.isArray(returnNewData?.selectProducts)
      ? returnNewData.selectProducts
      : [];

    return sourceItems.map((item, index) => ({
      id: String(item?.id || item?.orderItemUid || `prod-${index + 1}`),
      orderItemUid: item?.orderItemUid || '',
      name: item?.name || '',
      slug: item?.slug || '',
      image: item?.image || '',
      variant: item?.variant || '',
      unitRefund: Number(item?.unitRefund || 0),
      price: Number(item?.price || 0),
      mrp: Number(item?.snapMrp || 0),
      payableAmount: Number(item?.payableAmount || 0),
      coinUsed: Number(item?.coinUsed || 0),
      coinEarned: Number(item?.coinEarned || 0),
      lastReturnDate: item?.lastReturnDate || null,
      orderedQty: Number(item?.orderedQty || 1),
      returnedQty: Number(item?.alreadyReturnedQty || 0),
      remainingQty: Number(item?.remainingQty || 0),
      eligible: Boolean(item?.eligible),
      isFreeGift: Boolean(item?.isFreeGift),
      fullyReturned: Boolean(item?.fullyReturned),
      inReturn: Boolean(item?.inReturn),
      returnable: Boolean(item?.returnable),
    }));
  }, [returnNewData?.selectProducts]);

  const returnRequests = useMemo(() => {
    return Array.isArray(returnOverviewData?.returnRequests)
      ? returnOverviewData.returnRequests
      : [];
  }, [returnOverviewData?.returnRequests]);

  const order = useMemo(() => {
    if (!orderData) return null;

    const orderInfo = returnNewData?.orderInfo || {};
    const pickupAddress = returnNewData?.defaultPickupAddress;
    const deliveryAddressUid = String(
      orderData?.deliveryAddressUid ||
      orderData?.pickupAddressUid ||
      orderInfo?.deliveryAddressUid ||
      orderInfo?.shippingAddressUid ||
      orderInfo?.addressUid ||
      pickupAddress?.uid ||
      ''
    ).trim();

    return {
      orderId: orderData.orderId || orderInfo?.orderNumber || '',
      trxUid: orderData.trxUid || '',
      pickupAddressUid: deliveryAddressUid,
      orderDate: orderInfo?.orderDateLabel || orderData.placedAt || '',
      deliveryDate: orderInfo?.deliveredAtLabel || orderData.arrivedAt || '',
      receiverName: orderData.receiverName || pickupAddress?.fullName || '',
      receiverPhone: orderData.receiverPhone || pickupAddress?.phone || '',
      deliveryAddress: orderData.deliveryAddress || pickupAddress?.text || '',
    };
  }, [orderData, returnNewData]);

  useEffect(() => {
    onReturnRequestsChangeRef.current = onReturnRequestsChange;
  }, [onReturnRequestsChange]);

  useEffect(() => {
    if (
      !order?.orderId ||
      typeof onReturnRequestsChangeRef.current !== 'function'
    )
      return;
    onReturnRequestsChangeRef.current(order.orderId, returnRequests);
  }, [order?.orderId, returnRequests]);

  useEffect(() => {
    if (!selectedRequest) return;

    const refreshedRequest = returnRequests.find(
      (request) => request.id === selectedRequest.id
    );
    if (refreshedRequest) setSelectedRequest(refreshedRequest);
  }, [returnRequests, selectedRequest]);

  const cumulativeReturned = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const orderedQty = Number(p?.orderedQty || 0);
      const remainingQtyRaw = Number(p?.remainingQty);
      const remainingQty = Number.isFinite(remainingQtyRaw)
        ? Math.max(0, remainingQtyRaw)
        : Math.max(0, orderedQty - Number(p?.returnedQty || 0));

      map[p.id] = Math.min(orderedQty, Math.max(0, orderedQty - remainingQty));
    });
    return map;
  }, [products]);

  const maxReturnable = (productId) => {
    const normalizedProductId = String(productId);
    const product = products.find((p) => String(p.id) === normalizedProductId);
    if (!product) return 0;

    const remainingQtyRaw = Number(product?.remainingQty);
    if (Number.isFinite(remainingQtyRaw)) return Math.max(0, remainingQtyRaw);

    return Math.max(
      0,
      product.orderedQty - (cumulativeReturned[normalizedProductId] || 0)
    );
  };

  const clearProductData = (productId) => {
    const normalizedProductId = String(productId);

    setReturnQty((q) => {
      const next = { ...q };
      delete next[normalizedProductId];
      return next;
    });

    setReturnReasons((r) => {
      const next = { ...r };
      delete next[normalizedProductId];
      return next;
    });

    setReturnNotes((n) => {
      const next = { ...n };
      delete next[normalizedProductId];
      return next;
    });

    setReasonErrors((errs) => {
      const next = { ...errs };
      delete next[normalizedProductId];
      return next;
    });

    setUploadErrors((errs) => {
      const next = { ...errs };
      delete next[normalizedProductId];
      return next;
    });

    setReturnImages((imgs) => {
      const next = { ...imgs };
      if (next[normalizedProductId]) {
        next[normalizedProductId].forEach((img) =>
          URL.revokeObjectURL(img.preview)
        );
      }
      delete next[normalizedProductId];
      return next;
    });
  };

  const handleSelectProduct = (productId) => {
    const normalizedProductId = String(productId);
    const maxQty = maxReturnable(normalizedProductId);
    if (maxQty <= 0) return;

    const previouslySelected = Object.keys(selectedProducts).filter(
      (pid) => selectedProducts[pid] && pid !== normalizedProductId
    );
    previouslySelected.forEach(clearProductData);

    setSelectedProducts({ [normalizedProductId]: true });
    setReturnQty((q) => ({
      ...q,
      [normalizedProductId]: Math.min(
        maxQty,
        Math.max(1, q[normalizedProductId] || 1)
      ),
    }));
  };

  const handleQtyChange = (productId, delta) => {
    const normalizedProductId = String(productId);
    const max = maxReturnable(normalizedProductId);
    setReturnQty((prev) => ({
      ...prev,
      [normalizedProductId]: Math.min(
        max,
        Math.max(1, (prev[normalizedProductId] || 1) + delta)
      ),
    }));
  };

  const handleImageUpload = (productId, e) => {
    const files = Array.from(e.target.files || []);
    const existingFiles = returnImages[productId] || [];

    setUploadErrors((prev) => ({ ...prev, [productId]: null }));

    if (existingFiles.length + files.length > MAX_FILES) {
      setUploadErrors((prev) => ({
        ...prev,
        [productId]: `Maximum ${MAX_FILES} files allowed. You can upload ${MAX_FILES - existingFiles.length} more.`,
      }));
      if (e.target) e.target.value = '';
      return;
    }

    const validatedFiles = [];
    const errors = [];

    for (const file of files) {
      const fileType = file.type;
      const fileSize = file.size;
      const isImage = allowedImageTypes.includes(fileType);
      const isVideo = allowedVideoTypes.includes(fileType);

      if (!isImage && !isVideo) {
        errors.push(
          `${file.name}: Invalid file type. Only JPG, PNG, WebP images and MP4, WebM videos are allowed.`
        );
        continue;
      }

      if (isImage && fileSize > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image size must be less than 5MB.`);
        continue;
      }

      if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        errors.push(`${file.name}: Video size must be less than 20MB.`);
        continue;
      }

      validatedFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
        size: fileSize,
        name: file.name,
      });
    }

    if (errors.length > 0) {
      setUploadErrors((prev) => ({
        ...prev,
        [productId]: errors.join(' '),
      }));
    }

    if (validatedFiles.length > 0) {
      setReturnImages((prev) => ({
        ...prev,
        [productId]: [...existingFiles, ...validatedFiles],
      }));
    }

    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (productId, imageId) => {
    setReturnImages((prev) => {
      const productImages = prev[productId] || [];
      const img = productImages.find((i) => i.id === imageId);
      if (img) URL.revokeObjectURL(img.preview);
      return {
        ...prev,
        [productId]: productImages.filter((i) => i.id !== imageId),
      };
    });
    setUploadErrors((prev) => ({ ...prev, [productId]: null }));
  };

  const validateReturnDetails = () => {
    const nextReasonErrors = {};
    const selectedIds = Object.keys(selectedProducts).filter(
      (pid) => selectedProducts[pid]
    );

    selectedIds.forEach((pid) => {
      const reason = String(returnReasons[pid] || '').trim();
      const note = String(returnNotes[pid] || '').trim();

      if (!reason) {
        nextReasonErrors[pid] = 'Please select a reason for return.';
        return;
      }

      if (reason === 'other' && note.length < 10) {
        nextReasonErrors[pid] =
          'For "Other", additional details are required (minimum 10 characters).';
      }
    });

    setReasonErrors(nextReasonErrors);
    return Object.keys(nextReasonErrors).length === 0;
  };

  const selectedCount = Object.keys(selectedProducts).filter(
    (k) => selectedProducts[k]
  ).length;

  const estimatedRefund = useMemo(() => {
    let total = 0;
    Object.keys(selectedProducts).forEach((pid) => {
      if (selectedProducts[pid]) {
        const product = products.find((p) => String(p.id) === String(pid));
        if (product) {
          const quantity = Number(returnQty[pid] || 1);
          const unitRefund = Number(product.unitRefund || 0);
          // const fallbackUnitAmount = Number(product.price || 0);
          const effectiveUnitAmount = unitRefund > 0 ? unitRefund : 0;
          total += effectiveUnitAmount * quantity;
        }
      }
    });
    return total;
  }, [selectedProducts, returnQty, products]);

  const estimatedCoinSummary = useMemo(() => {
    let usedCoins = 0;

    Object.keys(selectedProducts).forEach((pid) => {
      if (!selectedProducts[pid]) return;

      const product = products.find((p) => String(p.id) === String(pid));
      if (!product) return;

      const quantity = Number(returnQty[pid] || 1);
      const coinUsed = Number(product?.coinUsed || 0);
      const totalPlacedQty = Number(product?.orderedQty || 1);
      const remainingQty = Number(product?.remainingQty || 0);

      if (!Number.isFinite(coinUsed) || coinUsed <= 0) return;
      if (!Number.isFinite(totalPlacedQty) || totalPlacedQty <= 0) return;

      const coinPerUnit = coinUsed / totalPlacedQty;
      usedCoins += coinPerUnit * quantity;
    });

    return {
      usedCoins: Math.round(usedCoins),
      earnedCoins: 0,
      totalCoins: Math.round(usedCoins),
    };
  }, [selectedProducts, returnQty, products]);

  const canSubmit = useMemo(() => {
    if (selectedCount === 0 || isSubmitting) return false;
    const selectedIds = Object.keys(selectedProducts).filter(
      (k) => selectedProducts[k]
    );

    const hasReasons = selectedIds.every((pid) => {
      const reason = String(returnReasons[pid] || '').trim();
      if (!reason) return false;

      if (reason === 'other')
        return String(returnNotes[pid] || '').trim().length >= 10;

      return true;
    });

    const hasMinUploads = selectedIds.every((pid) => {
      const files = returnImages[pid] || [];
      return files.length >= 1;
    });

    return hasReasons && hasMinUploads;
  }, [
    selectedCount,
    isSubmitting,
    selectedProducts,
    returnReasons,
    returnImages,
    returnNotes,
  ]);

  const handleOpenReturnPolicyPdf = () => {
    window.open(RETURN_POLICY_PDF_URL, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitReturn = async () => {
    if (!canSubmit) return;
    if (!validateReturnDetails()) {
      ToastNotification(
        'error',
        'Please complete the required return details.'
      );
      return;
    }

    if (!order?.trxUid) {
      ToastNotification(
        'error',
        'Unable to create return request. Missing transaction id.'
      );
      return;
    }

    if (!order?.pickupAddressUid) {
      ToastNotification(
        'error',
        'Unable to create return request. Missing pickup address.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedIds = Object.keys(selectedProducts).filter(
        (pid) => selectedProducts[pid]
      );

      const requestItems = [];
      const allProofFiles = [];

      selectedIds.forEach((pid) => {
        const product = products.find((p) => String(p.id) === String(pid));
        if (!product) return;

        const qty = returnQty[pid] || 1;
        const reason = returnReasons[pid] || '';
        const notes = returnNotes[pid] || '';
        const files = returnImages[pid] || [];

        requestItems.push({
          orderItemUid: product.orderItemUid,
          quantity: qty,
          reason,
          additionalNote: notes,
        });

        files.forEach((fileObj) => {
          allProofFiles.push(fileObj);
        });
      });

      if (requestItems.some((item) => !item.orderItemUid)) {
        throw new Error(
          'Missing order item id for one or more selected products.'
        );
      }

      const uploadedProofFiles = await Promise.all(
        allProofFiles.map(async (fileObj) => {
          const imageKey = await uploadFileToS3(
            fileObj.file,
            RETURN_PROOF_UPLOAD_FOLDER
          );

          return {
            imageKey,
            fileType: fileObj.type,
            fileName: fileObj.name,
            fileSize: fileObj.size,
          };
        })
      );

      const payload = buildReturnRequestPayload({
        pickupAddressUid: order.pickupAddressUid,
        items: requestItems,
        proofFiles: uploadedProofFiles,
      });

      const response = await createReturnRequest(order.trxUid, payload);

      await queryClient.invalidateQueries({
        queryKey: ['return-overview', order.trxUid],
      });
      await queryClient.invalidateQueries({
        queryKey: ['return-new', order.trxUid],
      });
      await queryClient.refetchQueries({
        queryKey: ['return-overview', order.trxUid],
        type: 'active',
      });
      await queryClient.refetchQueries({
        queryKey: ['return-new', order.trxUid],
        type: 'active',
      });

      ToastNotification(
        'success',
        response?.message || 'Return request submitted successfully'
      );
      resetCreateForm();
      setCurrentView(VIEW.OVERVIEW);
    } catch (error) {
      console.error('Error submitting return:', error);
      ToastNotification(
        'error',
        error?.message || 'Failed to submit return request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedProducts({});
    setReturnQty({});
    setReturnReasons({});
    setReturnNotes({});
    setUploadErrors({});
    setReasonErrors({});

    Object.values(returnImages).forEach((images) => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    });
    setReturnImages({});
  };

  const handleViewRequestDetails = (req) => {
    setSelectedRequest(req);
    setOpenDetails(true);
  };

  const returnableProducts = products.filter((p) => {
    return (
      Boolean(p?.returnable) && maxReturnable(p.id) > 0 && !p?.fullyReturned
    );
  });

  const fullyReturnedProducts = products.filter((p) => {
    return !p?.returnable || p?.fullyReturned || maxReturnable(p.id) <= 0;
  });

  const handleCreateNewReturnClick = () => {
    resetCreateForm();
    setCurrentView(VIEW.CREATE);
  };

  const handleReasonChange = (pid, nextReason) => {
    setReturnReasons((prev) => ({
      ...prev,
      [pid]: nextReason,
    }));

    setReasonErrors((prev) => {
      const next = { ...prev };
      delete next[pid];
      return next;
    });
  };

  const handleNoteChange = (pid, nextNote) => {
    setReturnNotes((prev) => ({
      ...prev,
      [pid]: nextNote,
    }));

    setReasonErrors((prev) => {
      const next = { ...prev };
      delete next[pid];
      return next;
    });
  };

  return (
    <>
      {showHeading && <AccountHeading title="Return Orders" />}
      <div className="overflow-y-auto h-100 p-3 common-scrollbar">
        <div className="wallet-table mt-0 return-orders-shell">
          {currentView === VIEW.OVERVIEW && (
            <div className="return-overview">
              {(isOverviewTabLoading || isOverviewLoading) && (
                <div className="no-returns mb-3">
                  <p>Loading return requests...</p>
                </div>
              )}

              <ReturnRequestsList
                returnRequests={returnRequests}
                onViewRequestDetails={handleViewRequestDetails}
              />

              <AvailableProductsList
                products={returnableProducts}
                cumulativeReturned={cumulativeReturned}
              />

              <NonReturnableProductsList
                products={fullyReturnedProducts}
                maxReturnable={maxReturnable}
              />

              {/* <div className="return-fixed-spacer" /> */}
            </div>
          )}

          {currentView === VIEW.CREATE && (
            <>
              <div className="return-section create-view-header">
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <h6 className="section-title mb-0">
                    Create New Return Request
                  </h6>
                  <button
                    type="button"
                    className="btn-primary rounded-1 text-sm"
                    onClick={() => {
                      resetCreateForm();
                      setCurrentView(VIEW.OVERVIEW);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>

              {isNewReturnLoading ? (
                <NewReturnFormSkeleton />
              ) : (
                <NewReturnForm
                  orderData={orderData}
                  products={products}
                  selectedProducts={selectedProducts}
                  selectedCount={selectedCount}
                  cumulativeReturned={cumulativeReturned}
                  returnQty={returnQty}
                  returnReasons={returnReasons}
                  returnNotes={returnNotes}
                  returnImages={returnImages}
                  uploadErrors={uploadErrors}
                  reasonErrors={reasonErrors}
                  reasonOptions={reasonOptions}
                  isSubmitting={isSubmitting}
                  order={order}
                  estimatedRefund={estimatedRefund}
                  estimatedCoinSummary={estimatedCoinSummary}
                  maxReturnable={maxReturnable}
                  getReturnReasonLabel={getReturnReasonLabel}
                  onSelectProduct={handleSelectProduct}
                  onQtyChange={handleQtyChange}
                  onOpenReturnPolicyPdf={handleOpenReturnPolicyPdf}
                  onReasonChange={handleReasonChange}
                  onNoteChange={handleNoteChange}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                />
              )}
            </>
          )}

          <ReturnOrderDetails
            isOpen={openDetails}
            returnUid={selectedRequest?.returnRequestUid}
            onClose={() => setOpenDetails(false)}
          />
        </div>
      </div>
      {currentView === VIEW.OVERVIEW && (
        <div className="cart-footer order-details-footer return-fixed-cta">
          <button
            className="btn-submit-return btn-primary"
            onClick={handleCreateNewReturnClick}
            disabled={returnableProducts.length === 0 || !orderData}
          >
            Create New Return Request
          </button>
        </div>
      )}
      {currentView === VIEW.CREATE && selectedCount > 0 && (
        <div className="cart-footer order-details-footer return-fixed-cta return-submit-sticky">
          <button
            className="btn-submit-return btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmitReturn}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      )}
    </>
  );
};

export default ReturnOrders;
