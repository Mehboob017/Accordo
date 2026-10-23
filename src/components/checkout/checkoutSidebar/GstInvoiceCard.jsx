'use client';

import React, { useContext, useEffect, useMemo } from 'react';
import { RiArrowRightSLine, RiEditLine, RiFileTextLine } from 'react-icons/ri';
import UserContext from '@/helper/userContext';
import { useCustomerAddresses } from '@/utils/hooks/useCustomerAddress';
import styles from './GstInvoiceCard.module.scss';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';

const GstInvoiceCard = ({
  onClick,
  isBillingSelected = false,
  onBillingSelectionChange,
  onBillingAddressChange,
}) => {
  const { isAuthenticated } = useContext(UserContext);
  const { data } = useCustomerAddresses({ enabled: isAuthenticated });

  const billingAddress = useMemo(() => {
    const addresses = Array.isArray(data?.data?.addresses)
      ? data.data.addresses
      : [];

    return addresses.find((address) => address?.type === 'billing') || null;
  }, [data?.data?.addresses]);

  const billingName =
    billingAddress?.companyName ||
    `${capitalizeWords(billingAddress?.firstName || '')} ${capitalizeWords(billingAddress?.lastName || '')}`.trim() ||
    'Billing Address';
  const billingGstNumber = billingAddress?.gstNo || '';
  const billingAddressUid =
    billingAddress?.uid || billingAddress?.id || billingAddress?.userId || '';

  // Notify parent component whenever the billing address UID changes
  useEffect(() => {
    onBillingAddressChange?.(billingAddressUid);
  }, [billingAddressUid, onBillingAddressChange]);

  /**
   * Auto-select checkbox by default when:
   * 1. A billing address is loaded for the first time.
   * 2. The user modifies/updates an existing billing address.
   */
  useEffect(() => {
    if (billingAddress) {
      onBillingSelectionChange?.(true);
    } else {
      onBillingSelectionChange?.(false);
    }
    // We intentionally listen only to `billingAddress` changes.
    // This ensures auto-selection on add/update without overriding manual unchecking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingAddress]);

  if (!isAuthenticated) {
    return null;
  }

  const handleActivate = () => {
    if (onClick) onClick();
  };

  const handleCardClick = () => {
    if (billingAddress) {
      onBillingSelectionChange?.(!isBillingSelected);
      return;
    }

    handleActivate();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    handleActivate();
  };

  const handleBillingToggle = (event) => {
    event.stopPropagation();
    onBillingSelectionChange?.(event.target.checked);
  };

  return (
    <div
      className={`${styles.gstCard} ${billingAddress ? styles.gstCardSaved : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.leftContent}>
        {billingAddress ? (
          <label className={styles.checkboxBox}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={isBillingSelected}
              onChange={handleBillingToggle}
              aria-label="Use billing address for GST invoice"
            />
          </label>
        ) : (
          <div className={styles.iconBox}>
            <RiFileTextLine className={styles.icon} />
          </div>
        )}

        <div className={styles.textContent}>
          {billingAddress ? (
            <>
              <span className={styles.meta}>Get GST Invoice</span>
              <span className={styles.title}>{billingName}</span>
              {billingGstNumber ? (
                <span className={styles.gstNumber}>
                  GSTIN: {billingGstNumber}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span className={styles.title}>Get GST Invoice</span>
              <span className={styles.subtitle}>
                Claim up to 5% with the GST Invoice
              </span>
            </>
          )}
        </div>
      </div>

      {billingAddress ? (
        <button
          type="button"
          className={styles.editButton}
          onClick={handleEditClick}
          aria-label="Edit GST invoice details"
        >
          <RiEditLine className={styles.editIcon} />
        </button>
      ) : (
        <RiArrowRightSLine className={styles.arrow} />
      )}
    </div>
  );
};

export default GstInvoiceCard;
