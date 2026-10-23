'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import {
  RiCloseFill,
  // RiMapPinLine,
  // RiPhoneLine,
  // RiUserLine,
  RiImageLine,
  RiFilePdf2Line,
  RiVideoLine,
  RiCustomerServiceLine,
  RiInformationLine,
  RiRefreshLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
} from 'react-icons/ri';
import {
  FaCheckCircle,
  FaTimesCircle,
  // FaUndo,
  // FaTruck,
  // FaSearch,
  // FaBox,
  // FaMoneyBillWave,
  FaExclamationCircle,
} from 'react-icons/fa';
import {
  useCancelReturnRequest,
  useReturnDetail,
} from '@/utils/hooks/useMyOrders';
import styles from './ReturnOrderDetails.module.scss';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { getStatusMeta } from '@/utils/orders/statusMapper';

// const FALLBACK_PRODUCT_IMAGE = '/assets/images/placeholder.png';

// ─── Reason Label Map ──────────────────────────────────────────────────────────

const REASON_LABELS = {
  wrong_item_received: 'Wrong Item Received',
  damaged_product: 'Damaged Product',
  defective_product: 'Defective Product',
  not_as_described: 'Not as Described',
  quality_issue: 'Quality Issue',
  expired_product: 'Expired Product',
  missing_parts: 'Missing Parts / Accessories',
  changed_mind: 'Changed Mind',
  other: 'Other',
};

const getReasonLabel = (reason) => {
  const key = String(reason || '').toLowerCase();
  return REASON_LABELS[key] || reason || 'Not specified';
};

// ─── Format Helpers ────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateShort = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatPaymentMode = (mode) => {
  const map = {
    NETBANKING: 'Net Banking',
    UPI: 'UPI',
    CARD: 'Card',
    COD: 'Cash on Delivery',
    WALLET: 'Wallet',
  };
  return map[String(mode || '').toUpperCase()] || mode || 'N/A';
};

const getReturnedCoinsForItem = (item) => {
  const totalCoinUsed = Number(item?.coinUsed || 0);
  const totalOrderedQty = Number(item?.totalOrderedQty || 0);
  const returnQty = Number(item?.returnQty || 0);

  if (totalCoinUsed <= 0 || totalOrderedQty <= 0 || returnQty <= 0) return 0;

  const unitItemCoins = totalCoinUsed / totalOrderedQty;
  const returnedCoins = unitItemCoins * returnQty;

  return returnedCoins ?? 0;
};

const formatPoints = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0';
  const rounded = Number(value.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

const getPreviewKind = (file = {}) => {
  const rawType = String(
    file?.mimeType || file?.type || file?.fileMimeType || ''
  ).toLowerCase();
  const rawFileType = String(file?.fileType || '').toLowerCase();
  const sourceUrl = String(file?.fileUrl || file?.url || '').toLowerCase();

  if (
    rawType.startsWith('image/') ||
    rawFileType === 'image' ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|#|$)/.test(sourceUrl)
  ) {
    return 'image';
  }

  if (
    rawType.startsWith('video/') ||
    rawFileType === 'video' ||
    /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/.test(sourceUrl)
  ) {
    return 'video';
  }

  return 'document';
};

const normalizeStatusKey = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
};

const resolveStatusDate = (entry = {}) => {
  return entry?.createdAt || entry?.changedAt || entry?.date || '';
};

const buildTimelineSteps = (statusHistory = [], fallbackStatus = '') => {
  const normalizedHistory = Array.isArray(statusHistory) ? statusHistory : [];

  const sortedHistory = normalizedHistory
    .map((entry, index) => {
      const rawStatus = String(entry?.status || '').trim();
      const rawDate = resolveStatusDate(entry);
      const parsedTime = rawDate ? new Date(rawDate).getTime() : NaN;

      if (!rawStatus) {
        return null;
      }

      return {
        key: normalizeStatusKey(rawStatus),
        label: getStatusMeta(rawStatus).label,
        rawDate,
        sortValue: Number.isNaN(parsedTime) ? null : parsedTime,
        index,
      };
    })
    .filter(Boolean)
    .sort((stepA, stepB) => {
      if (stepA.sortValue !== null && stepB.sortValue !== null) {
        return stepA.sortValue - stepB.sortValue;
      }

      if (stepA.sortValue !== null) {
        return -1;
      }

      if (stepB.sortValue !== null) {
        return 1;
      }

      return stepA.index - stepB.index;
    });

  const uniqueHistory = sortedHistory.reduce((accumulator, step) => {
    if (accumulator.some((item) => item.key === step.key)) {
      return accumulator;
    }

    accumulator.push(step);
    return accumulator;
  }, []);

  const fallbackKey = normalizeStatusKey(fallbackStatus);

  if (fallbackKey && !uniqueHistory.some((step) => step.key === fallbackKey)) {
    uniqueHistory.push({
      key: fallbackKey,
      label: getStatusMeta(fallbackStatus).label,
      rawDate: '',
    });
  }

  return uniqueHistory;
};

// ─── Sub-Components ────────────────────────────────────────────────────────────

const SkeletonBlock = ({ height = 16, width = '100%', borderRadius = 8 }) => (
  <div className={styles.skeleton} style={{ height, width, borderRadius }} />
);

const SectionSkeleton = () => (
  <div className={styles.section}>
    <SkeletonBlock height={14} width="40%" />
    <div style={{ marginTop: 12 }}>
      <SkeletonBlock height={60} />
    </div>
    <div style={{ marginTop: 8 }}>
      <SkeletonBlock height={60} />
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className={styles.skeletonWrap}>
    <div className={styles.skeletonHeader}>
      <SkeletonBlock height={20} width="55%" />
      <SkeletonBlock height={24} width="28%" borderRadius={20} />
    </div>
    <SectionSkeleton />
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className={styles.errorState}>
    <FaExclamationCircle className={styles.errorIcon} />
    <p className={styles.errorMessage}>
      {message || 'Failed to load return details.'}
    </p>
    {onRetry && (
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        <RiRefreshLine /> Try Again
      </button>
    )}
  </div>
);

// ─── Progress Timeline ─────────────────────────────────────────────────────────

const ProgressTimeline = ({ status, statusHistory }) => {
  const steps = useMemo(
    () => buildTimelineSteps(statusHistory, status),
    [status, statusHistory]
  );
  const normalizedCurrent = normalizeStatusKey(status);
  const currentIndex = steps.findIndex(
    (step) => step.key === normalizedCurrent
  );
  const resolvedCurrentIndex =
    currentIndex >= 0 ? currentIndex : steps.length - 1;

  return (
    <ul className={styles.timeline}>
      {steps.map((step, index) => {
        const isCompleted = index <= resolvedCurrentIndex;
        const isActive = index === resolvedCurrentIndex;
        const stepDate = formatDate(step.rawDate);
        const { icon: StepIcon, color: stepColor } = getStatusMeta(step.key);

        return (
          <li
            key={step.key}
            className={[
              styles.timelineStep,
              isCompleted ? styles.completed : '',
              isActive ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--step-color': stepColor || 'var(--theme-color)' }}
          >
            <div className={styles.stepIndicator}>
              <span className={styles.stepCircle}>
                {isCompleted ? (
                  <StepIcon />
                ) : (
                  <span className={styles.stepDot} />
                )}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={[
                    styles.stepLine,
                    isCompleted && index < resolvedCurrentIndex
                      ? styles.lineCompleted
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </div>
            <div className={styles.stepContent}>
              <span className={styles.stepLabel}>{step.label}</span>
              {stepDate && (
                <span className={styles.stepDate}>{formatDate(stepDate)}</span>
              )}
              {isActive && !stepDate && (
                <span className={styles.stepCurrent}>Current status</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── Proof Image Viewer ────────────────────────────────────────────────────────

const ProofViewer = ({ files }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const previewFiles = useMemo(
    () =>
      (Array.isArray(files) ? files : []).map((file) => ({
        ...file,
        previewKind: getPreviewKind(file),
      })),
    [files]
  );

  if (!previewFiles.length) return null;

  const currentFile = previewFiles[activeIndex];

  const handleOpenViewer = (index) => {
    const targetFile = previewFiles[index];

    if (targetFile?.previewKind === 'document') {
      if (targetFile?.fileUrl && typeof window !== 'undefined') {
        window.open(targetFile.fileUrl, '_blank', 'noopener,noreferrer');
      }

      return;
    }

    setActiveIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className={styles.proofGallery}>
        {previewFiles.map((file, idx) => {
          const isImage = file.previewKind === 'image';
          const isVideo = file.previewKind === 'video';

          return (
            <button
              key={file.uid || idx}
              type="button"
              className={`${styles.proofThumb} ${!isImage ? styles.proofDocumentThumb : ''}`}
              onClick={() => handleOpenViewer(idx)}
              title={file.fileName}
            >
              {isImage ? (
                <img src={file.fileUrl} alt={file.fileName} draggable={false} />
              ) : isVideo ? (
                <video
                  src={file.fileUrl}
                  className={styles.proofVideoThumb}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <span className={styles.proofDocumentInner}>
                  <RiFilePdf2Line className={styles.proofDocumentIcon} />
                </span>
              )}
              <span className={styles.proofThumbOverlay}>
                {isImage ? (
                  <RiImageLine />
                ) : isVideo ? (
                  <RiVideoLine />
                ) : (
                  <RiFilePdf2Line />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {viewerOpen && previewFiles.length > 0 && (
        <div className={styles.lightboxOverlay} role="dialog" aria-modal="true">
          <div
            className={styles.lightboxBackdrop}
            onClick={() => setViewerOpen(false)}
          />
          <div className={styles.lightboxPanel}>
            <div className={styles.lightboxToolbar}>
              <span className={styles.lightboxFileName}>
                {currentFile?.fileName || 'Proof Image'}
              </span>
              <button
                type="button"
                className={styles.lightboxCloseBtn}
                onClick={() => setViewerOpen(false)}
              >
                <RiCloseLine />
              </button>
            </div>
            <div className={styles.lightboxImageWrap}>
              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.leftNav}`}
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                aria-label="Previous"
              >
                <RiArrowLeftSLine />
              </button>

              {currentFile?.previewKind === 'image' ? (
                <img
                  src={currentFile?.fileUrl}
                  alt={currentFile?.fileName || 'Proof'}
                  className={styles.lightboxImage}
                  draggable={false}
                />
              ) : currentFile?.previewKind === 'video' ? (
                <video
                  src={currentFile?.fileUrl}
                  className={styles.lightboxVideo}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : null}

              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.rightNav}`}
                onClick={() =>
                  setActiveIndex((prev) =>
                    Math.min(previewFiles.length - 1, prev + 1)
                  )
                }
                disabled={activeIndex >= previewFiles.length - 1}
                aria-label="Next"
              >
                <RiArrowRightSLine />
              </button>
            </div>
            <div className={styles.lightboxFooter}>
              <span>
                {activeIndex + 1} / {previewFiles.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ReturnOrderDetails = ({ isOpen, returnUid, onClose }) => {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useReturnDetail(returnUid, { enabled: isOpen && Boolean(returnUid) });
  const {
    mutateAsync: triggerCancelReturnRequest,
    isPending: isCancelReturnPending,
  } = useCancelReturnRequest();
  const [cancelReturnModal, setCancelReturnModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCancelReturnModal(false);
    }
  }, [isOpen]);

  const details = response?.data || null;

  const statusLabel = details ? getStatusMeta(details.displayStatus).label : '';
  const canCancel = details?.isCancellable;
  const canRetryRefund =
    details &&
    (String(details.status || '').toLowerCase() === 'refunded') === false &&
    String(details.status || '').toLowerCase() === 'picked_up';

  const handleClose = () => {
    if (isCancelReturnPending) return;
    setCancelReturnModal(false);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleCancelReturnClick = (event) => {
    event.preventDefault();

    if (isCancelReturnPending) return;

    setCancelReturnModal(true);
  };

  const handleConfirmCancelReturn = async () => {
    if (isCancelReturnPending) return;

    const normalizedReturnUid = String(
      returnUid || details?.returnUid || ''
    ).trim();

    if (!normalizedReturnUid) {
      ToastNotification(
        'info',
        'Return uid is required to cancel return request.'
      );
      setCancelReturnModal(false);
      return;
    }

    try {
      const result = await triggerCancelReturnRequest({
        returnUid: normalizedReturnUid,
      });
      ToastNotification(
        'success',
        result?.message || 'Return request cancelled successfully.'
      );
      setCancelReturnModal(false);
      await refetch();
    } catch (cancelError) {
      ToastNotification(
        'error',
        cancelError?.message || 'Failed to cancel return request.'
      );
    }
  };

  const expectedTimeline = useMemo(() => {
    if (!details) return null;
    const status = String(details.status || '').toLowerCase();
    if (status === 'refunded') return 'Refund completed';
    if (status === 'rejected' || status === 'cancelled')
      return 'No refund applicable';
    if (status === 'picked_up' || status === 'quality_check')
      return '3–5 business days after quality check';
    return '5–7 business days after pickup';
  }, [details]);

  return (
    <>
      <Offcanvas
        direction="end"
        isOpen={isOpen}
        className="order-details-offcanvas return-detail-offcanvas"
        backdrop="static"
        keyboard={!isCancelReturnPending}
      >
        {/* ── Sticky Header ── */}
        <OffcanvasHeader toggle={null}>
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <span className="header-text flex-grow-1">
              {isLoading ? (
                <SkeletonBlock height={16} width={140} />
              ) : details ? (
                <>
                  <span className="id">{details.returnNumber}</span>
                  <span className="item-count">
                    {details.items?.length ?? 0} item
                    {(details.items?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span className="id">Return Details</span>
              )}
            </span>
            {statusLabel && (
              <span
                className={`${styles.statusBadge} ${styles.statusBadgeTheme}`}
              >
                <span className={styles.statusBadgeIcon} style={{ lineHeight: 1 }}>
                  {(() => {
                    const { icon: StatusIcon, color } = getStatusMeta(details?.status || details?.displayStatus);
                    return <StatusIcon style={{ color }} />;
                  })()}
                </span>
                {statusLabel}
              </span>
            )}
            <button
              type="button"
              className="close-btn"
              onClick={handleClose}
              disabled={isCancelReturnPending}
              aria-label="Close"
            >
              <RiCloseFill />
            </button>
          </div>
        </OffcanvasHeader>

        <OffcanvasBody
          className="order-details-body hide-scrollbar"
          data-lenis-prevent
        >
          {isLoading && <LoadingSkeleton />}

          {isError && !isLoading && (
            <ErrorState message={error?.message} onRetry={refetch} />
          )}

          {!isLoading && !isError && !details && (
            <ErrorState message="Return details not found." onRetry={refetch} />
          )}

          {!isLoading && !isError && details && (
            <div className={`${styles.detailsBody} common-scrollbar`}>
              {/* ── Return Meta ── */}
              <div className={`${styles.returnMeta} order-summary-section`}>
                <div className={styles.returnMetaRow}>
                  <span className={styles.returnMetaLabel}>Return ID</span>
                  <span className={styles.returnMetaValue}>
                    {details.returnNumber}
                  </span>
                </div>
                <div className={styles.returnMetaRow}>
                  <span className={styles.returnMetaLabel}>Submitted on</span>
                  <span className={styles.returnMetaValue}>
                    {formatDate(details.createdAt) || '—'}
                  </span>
                </div>
                {/* <div className={styles.returnMetaRow}>
                <span className={styles.returnMetaLabel}>Refund Method</span>
                <span className={styles.returnMetaValue}>
                  {details.refundMethod || 'SDLINDIA Cash'}
                </span>
              </div> */}
              </div>

              {/* ── Admin Note ── */}
              {details.adminNote && (
                <div
                  className={`${styles.section} ${styles.adminNoteSection} order-summary-section`}
                >
                  <div className={styles.adminNoteInner}>
                    <RiInformationLine className={styles.adminNoteIcon} />
                    <span>{details.adminNote}</span>
                  </div>
                </div>
              )}

              {/* ── Refund Summary ── */}
              <div
                className={`${styles.section} ${styles.refundSection} order-summary-section`}
              >
                <h6 className={styles.sectionTitle}>Refund Summary</h6>
                <div className={styles.refundAmountRow}>
                  <span className={styles.refundAmountLabel}>Total Refund</span>
                  <span className={styles.refundAmountValue}>
                    ₹
                    {Number(
                      details.refundSummary?.totalRefundAmount || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className={styles.refundGrid}>
                  <div className={styles.refundGridItem}>
                    <span className={styles.refundGridLabel}>Destination</span>
                    <span className={styles.refundGridValue}>
                      {details.refundSummary?.refundMethod ||
                        details.refundMethod ||
                        'SDLINDIA Cash'}
                    </span>
                  </div>
                  <div className={styles.refundGridItem}>
                    <span className={styles.refundGridLabel}>Status</span>
                    <span
                      className={`${styles.refundGridValue} ${styles.statusTextTheme}`}
                    >
                      {statusLabel || '—'}
                    </span>
                  </div>
                  <div className={styles.refundGridItem}>
                    <span className={styles.refundGridLabel}>Items</span>
                    <span className={styles.refundGridValue}>
                      {details.refundSummary?.itemCount ?? 1}
                    </span>
                  </div>
                  <div className={styles.refundGridItem}>
                    <span className={styles.refundGridLabel}>Total Qty</span>
                    <span className={styles.refundGridValue}>
                      {details.refundSummary?.totalReturnQty ?? 1}
                    </span>
                  </div>
                </div>

                {/* {expectedTimeline && (
                  <div className={styles.refundTimeline}>
                    <RiInformationLine />
                    <span>Expected: 5–7 business days after pickup</span>
                  </div>
                )} */}

                {/* SDL Coins impact */}
                {details.coinImpact?.coinUsedRefund > 0 && (
                  <div className={styles.coinImpactBox}>
                    <span className={styles.coinImpactTitle}>
                      SDL Points Impact
                    </span>
                    <div className={styles.coinImpactRows}>
                      {details.coinImpact.coinUsedRefund > 0 && (
                        <div className={styles.coinImpactRow}>
                          <span>Points to be returned</span>
                          <span className={styles.textSuccess}>
                            +{details.coinImpact.coinUsedRefund} pts
                          </span>
                        </div>
                      )}
                      {/* {details.coinImpact.coinEarnedDeduction > 0 && (
                      <div className={styles.coinImpactRow}>
                        <span>Points to be deducted</span>
                        <span className={styles.textDanger}>
                          -{details.coinImpact.coinEarnedDeduction} pts
                        </span>
                      </div>
                    )} */}
                    </div>
                    <div className={styles.coinImpactDisclaimer}>
                      <RiInformationLine />
                      <span>
                        Returned SDL Points will not be usable until the refund is
                        finalized.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Return Progress ── */}
              <div className={`${styles.section} order-summary-section`}>
                <h6 className={styles.sectionTitle}>Return Progress</h6>
                <ProgressTimeline
                  status={details.status}
                  statusHistory={details.statusHistory}
                />
              </div>

              {/* ── Returned Items ── */}
              {Array.isArray(details.items) && details.items.length > 0 && (
                <div className={`${styles.section} order-summary-section`}>
                  <h6 className={styles.sectionTitle}>Returned Items</h6>
                  <ul className={styles.itemList}>
                    {details.items.map((item, idx) => (
                      <li key={item.uid || idx} className={styles.itemCard}>
                        <div className={styles.itemThumb}>
                          <Image
                            src={item.snapProductImage || ''}
                            alt={item.snapProductName || ''}
                            width={64}
                            height={64}
                            draggable={false}
                            unoptimized
                            className={styles.itemThumbImg}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>
                            {item.snapProductName || ''}
                          </span>
                          {item.snapVariantName && (
                            <span className={styles.itemVariant}>
                              {item.snapVariantName}
                            </span>
                          )}
                          <div className={styles.itemQtyRow}>
                            <span className={styles.itemQtyBadge}>
                              Return Qty: {item.returnQty}
                            </span>
                            {item.totalOrderedQty && (
                              <span className={styles.itemQtyOrdered}>
                                of {item.totalOrderedQty} ordered
                              </span>
                            )}
                          </div>
                          {item.reason && (
                            <span className={styles.reasonTag}>
                              {getReasonLabel(item.reason)}
                            </span>
                          )}
                          {item.additionalNote && (
                            <p className={styles.itemNote}>
                              {item.additionalNote}
                            </p>
                          )}
                        </div>
                        <div className={styles.itemRefund}>
                          <span className={styles.itemRefundAmount}>
                            ₹{Number(item.amounts?.refundAmount || 0).toFixed(2)}
                          </span>
                          <span className={styles.itemRefundLabel}>refund</span>
                          {getReturnedCoinsForItem(item) > 0 && (
                            <span className={styles.itemCoins}>
                              +{formatPoints(getReturnedCoinsForItem(item))} pts
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Proof Uploads ── */}
              {Array.isArray(details.proofFiles) &&
                details.proofFiles.length > 0 && (
                  <div
                    className={`${styles.section} ${styles.proofSection} order-summary-section`}
                  >
                    <h6
                      className={`${styles.sectionTitle} ${styles.proofSectionTitle}`}
                    >
                      Proof Uploads
                      <span className={styles.sectionCount}>
                        {details.proofFiles.length}
                      </span>
                    </h6>
                    <ProofViewer files={details.proofFiles} />
                  </div>
                )}

              {/* ── Pickup Details ── */}
              {details.pickupAddress && (
                <div className={`${styles.section} order-summary-section`}>
                  <h6 className={styles.sectionTitle}>Pickup Details</h6>
                  <div className={styles.pickupList}>
                    <div className={styles.pickupRow}>
                      {/* <RiUserLine className={styles.pickupIcon} /> */}
                      <span className="text-capitalize">
                        {details.pickupAddress.name || '—'}
                      </span>{' '}
                      | <span>{details.pickupAddress.phone || '—'}</span>
                    </div>
                    {/* <div className={styles.pickupRow}>
                    // <RiPhoneLine className={styles.pickupIcon} />
                    <span>{details.pickupAddress.phone || '—'}</span>
                  </div> */}
                    <div className={styles.pickupRow}>
                      {/* <RiMapPinLine className={styles.pickupIcon} /> */}
                      <span>{details.pickupAddress.address || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Order Information ── */}
              {details.order && (
                <div className={`${styles.section} order-summary-section`}>
                  <h6 className={styles.sectionTitle}>Order Information</h6>
                  <div className={styles.orderInfoGrid}>
                    <div className={styles.orderInfoItem}>
                      <span className={styles.orderInfoLabel}>Order ID</span>
                      <span className={styles.orderInfoValue}>
                        {details.order.orderNumber || '—'}
                      </span>
                    </div>
                    <div className={styles.orderInfoItem}>
                      <span className={styles.orderInfoLabel}>Payment</span>
                      <span className={styles.orderInfoValue}>
                        {formatPaymentMode(details.order.paymentMode)}
                      </span>
                    </div>
                    <div className={styles.orderInfoItem}>
                      <span className={styles.orderInfoLabel}>Order Date</span>
                      <span className={styles.orderInfoValue}>
                        {formatDateShort(details.order.orderDate) || '—'}
                      </span>
                    </div>
                    <div className={styles.orderInfoItem}>
                      <span className={styles.orderInfoLabel}>Order Status</span>
                      <span className={styles.orderInfoValue}>
                        {details.order.orderStatus
                          ? String(details.order.orderStatus)
                            .charAt(0)
                            .toUpperCase() +
                          String(details.order.orderStatus).slice(1)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Order amounts summary */}
                  {details.order.amounts && (
                    <div className={styles.orderAmountsWrap}>
                      <div className={styles.orderAmountRow}>
                        <span>Amount Paid</span>
                        <span>
                          ₹
                          {Number(
                            details.order.amounts.payableAmount || 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      {Number(details.order.amounts.coinUsed || 0) > 0 && (
                        <div className={styles.orderAmountRow}>
                          <span>SDL Points Used</span>
                          <span>{details.order.amounts.coinUsed} pts</span>
                        </div>
                      )}
                      {Number(details.order.amounts.coinEarned || 0) > 0 && (
                        <div className={styles.orderAmountRow}>
                          <span>SDL Points Earned</span>
                          <span>{details.order.amounts.coinEarned} pts</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom spacer for sticky footer */}
              <div style={{ height: 16 }} />
            </div>
          )}
        </OffcanvasBody>

        {/* ── Sticky Footer Actions ── */}
        {!isLoading && !isError && details && (
          <div className={styles.stickyFooter}>
            <a
              // href="tel:+918888888888"
              href="mailto:healthcare@sdlindia.com"
              className={`${styles.footerBtn} ${styles.footerBtnOutline}`}
            >
              <RiCustomerServiceLine />
              Contact Support
            </a>

            {canCancel && (
              <button
                type="button"
                className={`${styles.footerBtn} ${styles.footerBtnDanger}`}
                onClick={handleCancelReturnClick}
                disabled={isCancelReturnPending}
              >
                {isCancelReturnPending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    Cancel Return
                  </>
                )}
              </button>
            )}

            {/* {canRetryRefund && (
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
            >
              <RiRefreshLine />
              Retry Refund
            </button>
          )} */}
          </div>
        )}
      </Offcanvas>

      <ConfirmationModal
        modal={cancelReturnModal}
        setModal={setCancelReturnModal}
        isLoading={isCancelReturnPending}
        confirmFunction={handleConfirmCancelReturn}
        title="Cancel Return Request"
        message="Are you sure you want to cancel this return request? This action cannot be undone and your refund process will be stopped."
        cancelLabel="Keep Return"
        confirmLabel="Cancel Return"
      />
    </>
  );
};

export default ReturnOrderDetails;
