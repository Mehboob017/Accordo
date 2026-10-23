import { RiPriceTag3Line } from 'react-icons/ri';
import styles from './CouponModal.module.scss';

const buildDisplayFields = (coupon = {}) => {
  const resolvedCode =
    coupon?.code || coupon?.couponCode || coupon?.name || coupon?.uid || '-';
  const resolvedName =
    coupon?.displayName || coupon?.title || coupon?.name || coupon?.uid || '-';
  const resolvedShortDescription =
    coupon?.shortDescription?.trim() || 'No short description available';

  return {
    code: resolvedCode,
    name: resolvedName,
    shortDescription: resolvedShortDescription,
    termsAndConditions: String(coupon?.termsAndConditions || '').trim(),
  };
};

export default function CouponListItem({
  coupon,
  index,
  isExpanded,
  onToggleDetails,
  onApply,
  isApplied,
  isLoading,
}) {
  const couponFields = buildDisplayFields(coupon);
  const hasTermsAndConditions = Boolean(couponFields.termsAndConditions);

  return (
    <div className={styles.couponCard}>
      <div className={styles.couponHeader}>
        <div className={styles.couponLeft}>
          <div className={styles.couponIcon}>
            <RiPriceTag3Line />
          </div>

          <div className={styles.couponInfo}>
            {/* <p className={styles.couponMetaLabel}>
              <span className={styles.metaKey}>Code:</span> {couponFields.code}
            </p> */}
            <p className={styles.couponMetaLabel}>
              <span className={styles.metaKey}>Name:</span> {couponFields.name}
            </p>
            <p className={styles.couponDescription}>
              <span className={styles.metaKey}>Short Description:</span>{' '}
              {couponFields.shortDescription}
            </p>

            {hasTermsAndConditions && isExpanded && (
              <div
                className={styles.moreContent}
                dangerouslySetInnerHTML={{ __html: couponFields.termsAndConditions }}
              />
            )}

            {hasTermsAndConditions && (
              <button
                type="button"
                onClick={() => onToggleDetails(index)}
                className={styles.moreBtn}
              >
                +{isExpanded ? 'LESS' : 'MORE'}
              </button>
            )}
          </div>
        </div>

        {isApplied ? (
          <span className={styles.appliedBadge}>APPLIED</span>
        ) : (
          <button
            type="button"
            onClick={() => onApply(coupon)}
            className={styles.applyBtnSmall}
            disabled={isLoading}
          >
            APPLY
          </button>
        )}
      </div>
    </div>
  );
}
