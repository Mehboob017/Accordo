'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { RiCopperCoinLine, RiFileCopyLine } from 'react-icons/ri';
import { RiCheckboxCircleFill } from 'react-icons/ri';
import styles from './RefundList.module.scss';
import { getStatusMeta } from '@/utils/orders/statusMapper';

const formatStepDate = (value) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const copyToClipboard = (text) => {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(text).catch(() => { });
  }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const CoinBadge = ({ count }) => {
  if (!count || Number(count) <= 0) return null;
  return (
    <span className={styles.coinBadge}>
      {/* <Image
        src="/assets/images/svg/coin.svg"
        alt="SDL Coins"
        width={14}
        height={14}
        className={styles.coinIcon}
      /> */}
      <RiCopperCoinLine className={styles.coinIcon} size={13} />
      {count}
    </span>
  );
};

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={handleCopy}
      title={label}
      aria-label={label}
    >
      {copied ? (
        <RiCheckboxCircleFill className={styles.copiedIcon} />
      ) : (
        <RiFileCopyLine />
      )}
    </button>
  );
};

const RefundItemRow = ({ item }) => {
  const mrp = Number(item?.snapMrp || 0);
  const price = Number(item?.payableAmount || item?.snapPrice || 0);
  const coinUsed = Number(item?.coinUsed || 0);
  const quantity = Number(item?.quantity || 1);

  return (
    <li className={styles.refundItem}>
      <div className={styles.itemThumb}>
        {item?.snapProductImage ? (
          <img
            src={item.snapProductImage}
            alt={item.snapProductName || 'Product'}
            loading="lazy"
          />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
      </div>

      <div className={styles.itemInfo}>
        <p className={styles.itemName}>{item?.snapProductName || '—'}</p>
        <p className={styles.itemMeta}>
          {item?.snapVariantName ? `${item.snapVariantName} · ` : ''}
          Qty: {quantity}
        </p>
      </div>

      <div className={styles.itemPricing}>
        <span className={styles.itemPrice}>₹{price.toFixed(2)}</span>
        {mrp > price && (
          <span className={styles.itemMrp}>₹{mrp.toFixed(2)}</span>
        )}
        <CoinBadge count={coinUsed} />
      </div>
    </li>
  );
};

const StatusTimeline = ({ statusHistory = [] }) => {
  const resolvedCurrentIndex = statusHistory.length - 1;

  return (
    <ul className={styles.timeline}>
      {statusHistory.map((step, index) => {
        const isCompleted = index <= resolvedCurrentIndex;
        const isActive = index === resolvedCurrentIndex;
        const isLast = index === statusHistory.length - 1;
        const statusMeta = getStatusMeta(step.status);
        const StepIcon = statusMeta.icon;
        const stepColor = statusMeta.color;

        return (
          <li
            key={step.uid || index}
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
                {isCompleted ? <StepIcon /> : <span className={styles.dot} />}
              </span>
              {!isLast && (
                <span
                  className={[
                    styles.stepLine,
                    isCompleted && index < resolvedCurrentIndex
                      ? styles.stepLineCompleted
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </div>
            <div className={styles.stepContent}>
              <p className={styles.stepLabel}>{statusMeta.label}</p>
              {step.note && <p className={styles.stepNote}>{step.note}</p>}
              <span className={styles.stepDate}>
                {formatStepDate(step.createdAt)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── Main Card ───────────────────────────────────────────────────────────────

const RefundCard = ({ refund }) => {
  const [open, setOpen] = useState(false);

  const {
    refundAmount,
    PGReference,
    cancelledAt,
    refundNumber,
    coinsRefunded,
    ARN,
    RRN,
    cancelledItems = [],
    statusHistory = [],
  } = refund;

  const lastStatus =
    refundAmount > 0
      ? statusHistory[statusHistory.length - 1]?.currentStatus
      : 'refunded';
  const statusMeta = getStatusMeta(lastStatus);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div
      className={`${styles.refundCard} ${open ? styles.refundCardOpen : ''}`}
    >
      <div
        className={styles.cardHeader}
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
        aria-expanded={open}
      >
        <div className={styles.headerTop}>
          <div className={styles.amountRow}>
            {refundAmount > 0 && (
              <span className={styles.amountValue}>
                ₹{Number(refundAmount || 0).toFixed(2)}
              </span>
            )}
            {coinsRefunded > 0 && <CoinBadge count={coinsRefunded} />}
          </div>

          <div className={styles.headerRight}>
            {/* {(refundNumber || '') && (
              <div className={styles.refundIdFloat}>
                <span className={styles.refundIdValue}>
                  {refundNumber || ''}
                </span>
                <CopyButton text={refundNumber || ''} label="Copy Refund ID" />
              </div>
            )} */}
            <div className={styles.headerActions}>
              {/* <span
                className={`${styles.statusBadge} ${styles[statusMeta.className]}`}
              >
                {statusMeta.label}
              </span> */}
              <FaChevronDown
                className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.metaText}>
            To: <span className={styles.metaHighlight}>ONLINE</span>
          </span>
          <span className={styles.metaText}>
            Initiated on:{' '}
            <span className={styles.metaHighlight}>
              {formatStepDate(cancelledAt)}
            </span>
          </span>
          {refundNumber && (
            <div className={styles.metaText}>
              Refund number:{' '}
              <div className={styles.refundIdFloat}>
                <span className={styles.refundIdValue}>{refundNumber}</span>
                <CopyButton text={refundNumber} label="Copy Refund ID" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Expandable body ── */}
      <div className={`${styles.cardBody} ${open ? styles.cardBodyOpen : ''}`}>
        <div className={styles.cardBodyInner}>
          {/* Items */}
          {cancelledItems.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>REFUNDED ITEMS</p>
              <ul className={styles.itemsList}>
                {cancelledItems.map((item, i) => (
                  <RefundItemRow key={item?.orderItemUid || i} item={item} />
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {(statusHistory.length && refundAmount) > 0 && (
            <div className={styles.section}>
              <StatusTimeline statusHistory={statusHistory} />
            </div>
          )}

          <p className={styles.footerNote}>
            If there is an issue with your refund, please contact your bank and
            provide the ARN/RRN mentioned below.
          </p>

          {/* RRN */}
          {(ARN || RRN) && (
            <div className={`${styles.rrnBox} align-items-center d-flex gap-2`}>
              <p className={styles.rrnLabel}>ARN/RRN</p>
              <div className={styles.rrnRow}>
                <span className={styles.rrnValue}>{ARN || RRN}</span>
                <CopyButton text={ARN || RRN} label="Copy ARN/RRN" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── List ────────────────────────────────────────────────────────────────────

const RefundList = ({ refundHistory = [] }) => {
  if (!Array.isArray(refundHistory) || refundHistory.length === 0) return null;

  return (
    <div className="order-details-section order-summary-section">
      <h4 className="section-title">Refunds Details</h4>

      <div className={styles.refundList}>
        {/* <p className={styles.listTitle}>Refund History</p> */}
        {refundHistory.map((refund, i) => (
          <RefundCard key={refund?.refundNumber || i} refund={refund} />
        ))}
      </div>
    </div>
  );
};

export default RefundList;
