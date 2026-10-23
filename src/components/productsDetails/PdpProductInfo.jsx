'use client';

import { useContext, useEffect, useId, useRef, useState } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import SettingContext from '@/helper/settingContext';
import {
  useAddToWishlist,
  useIsInWishlist,
  useRemoveFromWishlist,
} from '@/utils/hooks/useWishlist';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import {
  POST_LOGIN_ACTIONS,
  storePendingPostLoginAction,
} from '@/utils/postLoginAction';
import {
  RiHeartFill,
  RiHeartLine,
  RiShareLine,
  RiStarFill,
  RiFacebookFill,
  RiFileCopyLine,
  RiCheckLine,
  RiLinkedinFill,
  RiTwitterFill,
  RiWhatsappFill,
  RiInformationLine,
} from 'react-icons/ri';
import {
  buildProductUrl,
  copyLinkToClipboard,
  getShareLinks,
  openShareWindow,
  formatReviewCount,
} from '@/utils/helpers';

/**
 * Product info panel for the new PDP (/products/[slug]).
 * Consumes raw camelCase API fields — does NOT rely on normalizeProduct output.
 */
const PdpProductInfo = ({
  productState,
  // --- New Pricing Props ---
  isDoctorProduct,
  isVerifiedDoctor
}) => {
  const reviewTooltipId = `review-info-${useId().replace(/:/g, '')}`;
  const { convertCurrency } = useContext(SettingContext);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState(false);
  const descriptionRef = useRef(null);

  const product = productState?.product || {};
  const selectedVariation = productState?.selectedVariation;

  // Raw field access
  const isInStock =
    selectedVariation?.inStockFlag ??
    product.productVariants?.[0]?.inStockFlag ??
    false;
  const sku =
    selectedVariation?.skuCode ?? product.productVariants?.[0]?.skuCode;
  const selectedVariantName =
    selectedVariation?.name ?? product.productVariants?.[0]?.name ?? '';
  const productName = product.name || selectedVariantName || '';
  const productSlug = product.slug ?? '';
  const productUid = product.uid;

  const isWishlisted = useIsInWishlist(productUid);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Keywords from raw category object + tags array
  const category = product.category;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  // const keywords = [category?.name, ...tags.map((t) => t?.name)].filter(
  //   Boolean
  // );

  const labels = Array.isArray(product.labels) ? product.labels : [];
  const keywordsLabels = [...labels.map((t) => t?.name)].filter(
    Boolean
  );

  // Pricing from raw variant fields
  const rawMrp =
    selectedVariation?.mrp ?? product.productVariants?.[0]?.mrp ?? 0;
  const rawDis =
    selectedVariation?.disPrice ??
    product.productVariants?.[0]?.disPrice ??
    rawMrp;
  const discount =
    rawMrp > 0 && rawDis < rawMrp
      ? Math.round(((rawMrp - rawDis) / rawMrp) * 100)
      : 0;

  const shortDescription = product.shortDescription;

  // Share
  const productUrl = buildProductUrl(productSlug);
  const shareLinks = getShareLinks(productUrl, productName);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: productName,
          url: productUrl,
        });
        return;
      } catch {
        // fall through to dropdown
      }
    }
    // setShowShareDropdown((prev) => !prev);
  };

  const shareOnFacebook = () =>
    openShareWindow(shareLinks.facebook, () => setShowShareDropdown(false));
  const shareOnTwitter = () =>
    openShareWindow(shareLinks.twitter, () => setShowShareDropdown(false));
  const shareOnWhatsApp = () =>
    openShareWindow(shareLinks.whatsapp, () => setShowShareDropdown(false));
  const shareOnLinkedIn = () =>
    openShareWindow(shareLinks.linkedin, () => setShowShareDropdown(false));
  const copyToClipboard = () =>
    copyLinkToClipboard(productUrl, () => setShowShareDropdown(false));

  const handleWishlistUpdate = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (!token) {
        if (productUid) {
          storePendingPostLoginAction({
            type: POST_LOGIN_ACTIONS.WISHLIST_PRODUCT,
            productId: productUid,
          });
        }
        setLoginModalOpen(true);
        return;
      }
    }

    if (!productUid) return;

    try {
      if (!isWishlisted) {
        await addToWishlistMutation.mutateAsync({ productUid, add: true });
        ToastNotification('success', 'Product added to wishlist.');
      } else {
        await removeFromWishlistMutation.mutateAsync({
          productUid,
          add: false,
        });
        ToastNotification('success', 'Product removed from wishlist.');
      }
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Unable to update wishlist. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (!shortDescription) {
      setIsDescriptionOverflowing(false);
      return undefined;
    }

    const element = descriptionRef.current;
    if (!element) return undefined;

    const checkOverflow = () => {
      const { scrollHeight, clientHeight } = element;
      setIsDescriptionOverflowing(scrollHeight - clientHeight > 1);
    };

    if (!showFullDescription) {
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }

    return undefined;
  }, [shortDescription, showFullDescription]);

  useEffect(() => {
    if (!product) return;

    window.dataLayer = window.dataLayer || [];
    // console.log(
    //   {
    //     currency: 'INR',
    //     value: productState?.selectedVariation?.disPrice,
    //     items: [
    //       {
    //         item_id: product.uid,
    //         item_name: product.name,
    //         price: productState?.selectedVariation?.disPrice,
    //         quantity: 1
    //       }
    //     ]
    //   }
    // )
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'INR',
        value: productState?.selectedVariation?.disPrice,
        items: [
          {
            item_id: product.uid,
            item_name: product.name,
            price: productState?.selectedVariation?.disPrice,
            quantity: 1
          }
        ]
      }
    });
  }, [product]);

  return (
    <>
      <div className="variation-top-info">
        <div className="variation-sku-stock">
          <span>
            <strong>SKU:</strong> {sku || 'N/A'}
          </span>
          <span
            className={`variation-stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`}
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="variation-action-buttons">
          <button
            className={`variation-icon-btn ${isWishlisted ? 'wishlist-active' : ''}`}
            onClick={handleWishlistUpdate}
            disabled={
              addToWishlistMutation.isPending ||
              removeFromWishlistMutation.isPending
            }
            title="Add to Wishlist"
          >
            {isWishlisted ? (
              <RiHeartFill size={18} />
            ) : (
              <RiHeartLine size={18} />
            )}
          </button>
          <div className="variation-share-wrapper">
            <button
              className="variation-icon-btn"
              onClick={handleShare}
              title="Share"
            >
              <RiShareLine size={18} />
            </button>
          </div>
        </div>
      </div>

      <h1 className="name">{productName}</h1>

      <div className="product-detail">
        {shortDescription ? (
          <>
            <p
              ref={descriptionRef}
              className={`product-short-description ${showFullDescription ? 'expanded' : 'collapsed'}`}
              data-lenis-prevent
              style={
                showFullDescription
                  ? undefined
                  : {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }
              }
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
            {isDescriptionOverflowing ? (
              <button
                type="button"
                className="btn btn-link p-0 read-more-btn"
                onClick={() => setShowFullDescription((prev) => !prev)}
              >
                {showFullDescription ? 'Read less' : 'Read more'}
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
        {keywordsLabels.length > 0 && (
          <div className="variation-keywords">
            {keywordsLabels.slice(0, 5).map((keyword, i) => (
              <span key={i} className="variation-keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {product.reviewCount > 0 && (
          <div className="product-rating custom-rate">
            <ul className="rating">
              <li>
                <RiStarFill />
              </li>
            </ul>
            <span className="ms-2">{product?.rating}</span>
            {product.reviewCount > 0 && (
              <span className="review">
                ({formatReviewCount(product.reviewCount)}{' '}
                {product.reviewCount > 1 ? 'Reviews' : 'Review'})
              </span>
            )}
            <button
              type="button"
              id={reviewTooltipId}
              className="border-0 bg-transparent p-0 d-inline-flex align-items-center"
              aria-label="Review information"
              style={{
                cursor: 'pointer',
                color: 'var(--content-color, #7e7e7e)',
                marginLeft: '6px',
                lineHeight: 1,
                verticalAlign: 'middle',
              }}
            >
              <RiInformationLine size={15} />
            </button>
            <UncontrolledTooltip
              placement="top"
              target={reviewTooltipId}
            >
              Average Rating Across Marketplaces & SDL India
            </UncontrolledTooltip>
          </div>
        )}
      </div>

      {/* --- Updated Pricing Logic Block --- */}
      <div className="price-rating">
        <h3 className="price">

          {isDoctorProduct ? (
            isVerifiedDoctor ? (
              // CASE 1: Doctor Product + Verified Doctor
              <>
                {convertCurrency(rawDis)}
                {rawMrp !== rawDis && (
                  <>
                    <span style={{
                      fontSize: 15, color: '#6f6f6f', lineHeight: 1
                    }}>M.R.P.</span>{" "}
                    <del className="text-content">{convertCurrency(rawMrp)}</del>
                    {discount ? <span className="offer-top">{discount}% Off</span> : null}
                  </>
                )}
              </>
            ) : (
              // CASE 2: Doctor Product + Unverified User (ONLY MRP SHOWS)
              <>
                <span style={{
                  fontSize: 15, color: '#6f6f6f', lineHeight: 1
                }}>M.R.P.</span>{" "}
                {convertCurrency(rawMrp)}
              </>
            )
          ) : (
            // CASE 3: Regular Product
            <>
              {convertCurrency(rawDis)}
              {rawMrp !== rawDis && (
                <>
                  <span style={{
                    fontSize: 15, color: '#6f6f6f', lineHeight: 1
                  }}>M.R.P.</span>{" "}
                  <del className="text-content">{convertCurrency(rawMrp)}</del>
                  {discount ? <span className="offer-top">{discount}% Off</span> : null}
                </>
              )}
            </>
          )}

          {/* Inclusive of taxes row stays visible in all cases */}
          <span className="w-100 d-flex align-items-center gap-1 mt-1 text-content price-mrp-line">
            <span className="d-inline-flex align-items-center gap-1 ms-1">
              <span>(Inclusive of all taxes)</span>
            </span>
          </span>
        </h3>
      </div>
      {/* --- End Updated Pricing Logic Block --- */}

      <OtpLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        setOpen={setLoginModalOpen}
      // redirectUrl="/wishlist"
      />
    </>
  );
};

export default PdpProductInfo;