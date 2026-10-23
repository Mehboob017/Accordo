import {
  memo,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './FilterOverflowList.module.scss';

export const DEFAULT_FILTER_OVERFLOW_LIMIT = 10;
const MOBILE_INLINE_BREAKPOINT = 768;
const ITEMS_PER_COL = 12;

const FilterOverflowList = ({
  items = [],
  limit = DEFAULT_FILTER_OVERFLOW_LIMIT,
  label = 'Options',
  listClassName = '',
  disabled = false,
  emptyState = null,
  renderItem,
}) => {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const titleId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInlineMode, setIsInlineMode] = useState(false);

  const normalizedLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Math.floor(Number(limit)))
    : DEFAULT_FILTER_OVERFLOW_LIMIT;

  const visibleItems = useMemo(
    () => items.slice(0, normalizedLimit),
    [items, normalizedLimit]
  );
  const overflowItems = useMemo(
    () => items.slice(normalizedLimit),
    [items, normalizedLimit]
  );
  const hiddenCount = overflowItems.length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateMode = () => {
      setIsInlineMode(window.innerWidth <= MOBILE_INLINE_BREAKPOINT);
    };

    updateMode();
    window.addEventListener('resize', updateMode);

    return () => {
      window.removeEventListener('resize', updateMode);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!hiddenCount) {
      setIsOpen(false);
    }
  }, [hiddenCount]);

  const handleTogglePanel = () => {
    if (disabled || !hiddenCount) {
      return;
    }

    setIsOpen((currentState) => !currentState);
  };

  const useGrid = items.length > ITEMS_PER_COL;

  const closeIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  const allItemsList = (
    <ul
      data-lenis-prevent
      className={[
        listClassName,
        styles.panelList,
        styles.panelListGrid,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item, index) =>
        renderItem?.(item, {
          index,
          isOverflow: index >= normalizedLimit,
        })
      )}
    </ul>
  );

  const panelContent = isInlineMode ? (
    <>
      <div
        className={styles.backdrop}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={styles.inlinePanel}
        role="dialog"
        aria-modal="true"
        aria-label={`${label} options`}
      >
        <div className={styles.sheetBar}>
          <div className={styles.sheetBarInfo}>
            <h2 className={styles.sheetBarTitle}>{label}</h2>
            <span className={styles.sheetBarSubtitle}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label={`Close ${label} options`}
          >
            {closeIcon}
          </button>
        </div>
        <div className={styles.panelBody}>{allItemsList}</div>
      </div>
    </>
  ) : (
    <>
      <div
        className={styles.backdrop}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        id={`${titleId}-panel`}
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${label} options`}
      >
        <div className={styles.panelBar}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label={`Close ${label} options`}
          >
            {closeIcon}
          </button>
        </div>
        <div className={styles.panelBody}>{allItemsList}</div>
      </div>
    </>
  );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <ul data-lenis-prevent className={listClassName}>
        {visibleItems.map((item, index) => renderItem?.(item, { index, isOverflow: false }))}

        {visibleItems.length === 0 && emptyState}
      </ul>

      {hiddenCount > 0 && (
        <div className={styles.triggerRow}>
          <button
            type="button"
            ref={triggerRef}
            className={styles.triggerButton}
            onClick={handleTogglePanel}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-controls={`${titleId}-panel`}
          >
            <span className={styles.triggerLabel}>+{hiddenCount} more</span>
            <span className={`${styles.triggerChevron}${isOpen ? ` ${styles.open}` : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      )}

      {isMounted && isOpen
        ? createPortal(panelContent, document.body)
        : null}
    </div>
  );
};

export default memo(FilterOverflowList);