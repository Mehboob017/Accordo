import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormGroup, Input } from 'reactstrap';
import { useCoupons } from '@/utils/hooks/useCoupons';
import CouponListItem from './CouponListItem';
import styles from './CouponModal.module.scss';

const couponSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .min(1, 'Coupon code is required')
    .regex(/^[A-Z0-9_-]+$/, 'Invalid coupon format')
    .toUpperCase(),
});

export default function CouponModal({
  onClose,
  onApplyCoupon,
  appliedCoupon,
  cartItems = [],
  isLoading = false,
  errorMessage = '',
}) {
  const [expandedCoupons, setExpandedCoupons] = useState(new Set());
  const [localErrorMessage, setLocalErrorMessage] = useState('');
  const {
    data: couponsResponse,
    isLoading: isCouponsLoading,
    error: couponsError,
  } = useCoupons({ items: cartItems });
  const availableCoupons = Array.isArray(couponsResponse?.data)
    ? couponsResponse.data
    : [];

  const methods = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: '',
    },
    mode: 'onChange',
  });

  const getCouponApplyPayload = (couponIdentifier = '') => {
    const normalizedIdentifier = String(couponIdentifier || '').trim().toUpperCase();

    const matchedCoupon = availableCoupons.find((coupon) => {
      const candidates = [coupon?.name, coupon?.code, coupon?.couponCode]
        .filter((value) => typeof value === 'string' && value.trim())
        .map((value) => value.trim().toUpperCase());

      return candidates.includes(normalizedIdentifier);
    });

    return {
      couponIdentifier,
      couponUid: String(matchedCoupon?.uid || '').trim(),
    };
  };

  const handleApply = async () => {
    setLocalErrorMessage('');

    const isValid = await methods.trigger();

    if (!isValid || isLoading) {
      return;
    }

    const values = methods.getValues();
    const couponCode = values.couponCode.toUpperCase();
    const couponPayload = getCouponApplyPayload(couponCode);

    try {
      const isApplied = await onApplyCoupon?.(couponPayload);

      if (!isApplied) {
        setLocalErrorMessage(
          'You are not eligible for this coupon. Please try another coupon!'
        );
        return;
      }

      methods.reset();
      onClose();
    } catch (error) {
      setLocalErrorMessage(
        error?.message ||
          'You are not eligible for this coupon. Please try another coupon!'
      );
      return;
    }
  };

  const handleCouponSelect = async (coupon) => {
    if (isLoading) {
      return;
    }

    setLocalErrorMessage('');

    const couponIdentifier =
      String(coupon?.name || coupon?.code || coupon?.couponCode || '').trim() ||
      String(coupon || '').trim();
    const couponUid = String(coupon?.uid || '').trim();

    try {
      const isApplied = await onApplyCoupon?.({
        couponIdentifier,
        couponUid,
      });

      if (!isApplied) {
        return;
      }

      methods.reset();
      onClose();
    } catch (error) {
      setLocalErrorMessage(
        error?.message ||
          'You are not eligible for this coupon. Please try another coupon!'
      );
    }
  };

  const toggleCouponDetails = (index) => {
    const newExpanded = new Set(expandedCoupons);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCoupons(newExpanded);
  };

  const resolvedErrorMessage =
    errorMessage ||
    localErrorMessage ||
    (couponsError?.message
      ? `Unable to load coupons: ${couponsError.message}`
      : '');

  const isDataLoading = isLoading || isCouponsLoading;

  return (
    <>
      <div className={styles.couponInputSection}>
        <FormGroup>
          <div className={styles.inputWrapper}>
            <Controller
              name="couponCode"
              control={methods.control}
              render={({ field, fieldState }) => (
                <div className="col">
                  <Input
                    {...field}
                    type="text"
                    id="couponCode"
                    className="input-common"
                    placeholder="Enter coupon code"
                    invalid={!!fieldState.error}
                    disabled={isDataLoading}
                    onChange={(event) =>
                      field.onChange(event.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApply();
                      }
                    }}
                  />
                  {fieldState.error && (
                    <div className={`message-error ${styles.errorText}`}>
                      {fieldState.error.message}
                    </div>
                  )}
                </div>
              )}
            />
            <button
              onClick={handleApply}
              className={styles.applyBtn}
              disabled={isDataLoading}
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {resolvedErrorMessage && (
            <div className={`message-error ${styles.errorText}`}>
              {resolvedErrorMessage}
            </div>
          )}
        </FormGroup>
      </div>

      <div>
        <h6 className={styles.sectionTitle}>Available Coupons</h6>

        {isCouponsLoading && (
          <div className={styles.emptyState}>Loading coupons...</div>
        )}

        {!isCouponsLoading && !availableCoupons.length && (
          <div className={styles.emptyState}>No coupons available right now.</div>
        )}

        {!isCouponsLoading &&
          availableCoupons.map((coupon, index) => (
            <CouponListItem
              key={coupon?.uid || coupon?.name || index}
              coupon={coupon}
              index={index}
              isExpanded={expandedCoupons.has(index)}
              onToggleDetails={toggleCouponDetails}
              onApply={handleCouponSelect}
              isApplied={
                String(appliedCoupon || '').toUpperCase() ===
                String(coupon?.name || coupon?.code || '').toUpperCase()
              }
              isLoading={isDataLoading}
            />
          ))}
      </div>
    </>
  );
}