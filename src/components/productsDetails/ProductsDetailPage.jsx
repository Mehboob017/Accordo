'use client';

import { useEffect, useMemo, useState, Suspense, useCallback, useRef, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Col, Row } from 'reactstrap';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';
import { useProductCore, useRelatedProducts, useProductReviews } from '@/utils/hooks/useProductDetail';
import styles from './ProductsDetailPage.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import FaqSection from '@/components/faq/FaqSection';
import { LeafSVG } from '@/components/common/CommonSVG';
import ProductThumbnailSlider from '../productDetails/productThumbnail/ProductThumbnailSlider';
import ProductDetailsContent from './ProductDetailsContent';
import StickyCheckout from '../productDetails/common/stickyCheckout';
import TrendingProductsSlider from './TrendingProductsSlider';
import TestimonialSection from './TestimonialSection';
import ReviewModal from '../productDetails/common/allModal/ReviewModal';
import CustomHeading from '@/components/common/CustomHeading';
import { BestSellerProducts } from '../home';
import { useUser } from '@/utils/hooks/useUser';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import ProductDetailSkeleton from './ProductDetailSkeleton';
import { trackMetaEvent } from '@/utils/metaPixel';
import KeywordsSection from '../common/KeywordsSection';
import CartContext from '@/helper/cartContext';

const getVariantRouteValue = (variant) =>
  variant?.slug || variant?.productVariantSlug || variant?.uid || null;

const selectDefaultVariant = (variants = []) => {
  if (!variants.length) return null;
  const inStock = variants.filter((v) => v.inStockFlag);
  const pool = inStock.length > 0 ? inStock : variants;
  return pool.reduce((min, v) => {
    const price = v.disPrice ?? v.mrp ?? Infinity;
    const minPrice = min.disPrice ?? min.mrp ?? Infinity;
    return price < minPrice ? v : min;
  }, pool[0]);
};

const hasRenderableContent = (value) => {
  if (!value) return false;
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;
};

const buildMarketAuthHtml = (authList, productName = '') => {
  const safeList = Array.isArray(authList) ? authList : [];
  const hasMarketAuth = safeList.length > 0;

  const listItemsHtml = hasMarketAuth
    ? safeList
      .map((item) => {
        const country = item?.country?.trim() || '';
        const desc = item?.description?.trim()
          ? ` - ${item.description.trim()}`
          : '';
        return `<li style="margin-bottom: 6px; display: list-item;"><strong>${country}</strong>${desc}</li>`;
      })
      .join('')
    : '';

  const marketAuthContent = hasMarketAuth
    ? `<p style="font-size: 13px; line-height: 1.5;">The product, <strong>${productName}</strong>, of Shree Dhootapapeshwar Limited, is authorised for sale in the following country/countries by the respective Regulatory Authorities:</p><ul style="margin-left: 20px; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">${listItemsHtml}</ul>`
    : `<p style="font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #666;">Not Available</p>`;

  return `<p>This product is authorised for sale in India.</p><hr /><p><strong>Other Market Authorizations:</strong></p>${marketAuthContent}<div style="font-size: 11px; text-align: justify; line-height: 1.6; color: #555;"><p style="margin-bottom: 8px;"><strong>Important Disclaimer:</strong></p><p style="margin-bottom: 8px;">Being subject to the regulatory and market requirements of each respective country, the product packaging, product classification, or any other specifications may vary.</p><p style="margin-bottom: 8px;">The product information provided on this website is for Indian consumers only and it may or may not correspond directly or indirectly to the product as available in countries other than India.</p><p style="margin-bottom: 8px;">The product is made available in respective countries exclusively through authorized importers and distributors appointed by the Company. Any other unauthorized mode/means of product availability is prohibited.</p><p style="margin-bottom: 8px;">This is for informational purposes only. While we strive to maintain up-to-date information, please note that the information displayed on this tab may differ from the actual status of other market authorization at any given time.</p><p style="margin-bottom: 8px;">Ayurvedic medicines are best consumed under the advise and guidance of Ayurved Physician.</p><p style="margin-bottom: 0;">For any further details or queries, kindly write us at: <a href="mailto:healthcare@sdlindia.com" target="_blank" rel="noopener" style="color: var(--theme-color, #007bff); text-decoration: underline;">healthcare@sdlindia.com</a></p></div>`;
};

const renderStars = (rating, totalStars = 5) => {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 !== 0;

  return Array.from({ length: totalStars }, (_, index) => {
    const starNumber = index + 1;
    if (starNumber <= fullStars)
      return <RiStarFill key={starNumber} className={styles['review-star']} />;
    if (starNumber === fullStars + 1 && hasHalfStar)
      return <RiStarHalfFill key={starNumber} className={styles['review-star']} />;
    return <RiStarLine key={starNumber} className={styles['review-star']} />;
  });
};

// ---------------------------------------------------------------------------
// Variant Listener
// ---------------------------------------------------------------------------
// function VariantListener({ onVariantChange }) {
//   const searchParams = useSearchParams();
//   useEffect(() => {
//     onVariantChange(searchParams.get('productVariant'));
//   }, [searchParams, onVariantChange]);
//   return null;
// }

function VariantListener({ onVariantChange }) {
  const searchParams = useSearchParams();
  const variant = searchParams.get('productVariant');

  useEffect(() => {
    onVariantChange(variant);
  }, [variant, onVariantChange]);

  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const RelatedProductsSection = ({ slug, productVariant }) => {
  const { data } = useRelatedProducts(slug, productVariant);
  const relatedProducts = data?.data?.relatedProducts ?? [];

  if (!relatedProducts.length) return null;

  return (
    // <WrapperComponent
    //   classes={{
    //     sectionClass: `section-b-space ${styles['details-trending-section']}`,
    //   }}
    //   noRowCol={true}
    // >
    //   <Row className="g-4 g-md-5">
    //     <Col xl={12}>
    <TrendingProductsSlider products={relatedProducts} />
    //     </Col>
    //   </Row>
    // </WrapperComponent>
  );
};

const ProductReviewsSection = ({ slug, productVariant, productState, isAuthenticated, canReview, reviewEligibility, loginModalOpen, setLoginModalOpen, isReviewModalOpen, setIsReviewModalOpen, refetch }) => {
  const { data } = useProductReviews(slug, productVariant);
  const apiData = data?.data;
  const ratingDistribution = apiData?.ratingDistribution ?? [];
  const productReviews = apiData?.productReviews ?? [];
  const totalReviewCount = ratingDistribution.reduce((sum, item) => sum + item.count, 0);

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
    } else if (canReview) {
      setIsReviewModalOpen(true);
    } else if (reviewEligibility?.hasReviewed) {
      ToastNotification('info', 'You have already reviewed this product');
    } else if (!reviewEligibility?.hasPurchased) {
      ToastNotification('info', 'Buy this product to review it');
    } else {
      ToastNotification('info', 'Buy this product to review it');
    }
  };

  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: `section-b-space ${styles['details-review-section']}`,
        }}
        noRowCol={true}
      >
        <Row>
          <Col>
            <CustomHeading
              title="Product Reviews"
              svgUrl={<LeafSVG className="icon-width" />}
              customClass="mb-0 text-center head mb-4"
            />

            <div className={styles['review-grid']}>
              {productState.product?.rating > 0 && (
                <>
                  <div className={styles['review-distribution-card']}>
                    {ratingDistribution.map((item, idx) => (
                      <div key={idx} className={styles['review-bar-row']}>
                        <div className={styles['review-bar-label']}>
                          <span>{item.star}</span>
                          <RiStarFill className={styles['review-mini-star']} />
                        </div>
                        <div className={styles['review-bar-track']}>
                          <div
                            className={styles['review-bar-fill']}
                            style={{
                              width: `${totalReviewCount > 0
                                ? (item.count / totalReviewCount) * 100
                                : 0
                                }%`,
                            }}
                          />
                        </div>
                        <span className={styles['review-bar-count']}>{item.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles['review-score-card']}>
                    <p className={styles['review-score-value']}>
                      {productState.product.rating}
                    </p>
                    <div className={styles['review-score-stars']}>
                      {renderStars(productState.product.rating)}
                    </div>
                    <p className={styles['review-score-count']}>
                      {productState.product.reviewCount} Ratings
                    </p>
                  </div>
                </>
              )}

              <div className={styles['review-cta-card']}>
                <h3>Review This Product</h3>
                <p>Let our customers know what you think</p>
                <button
                  type="button"
                  className={styles['review-cta-btn']}
                  onClick={handleReviewClick}
                >
                  Write a Review
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </WrapperComponent>

      {productReviews.length > 0 && (
        <TestimonialSection testimonials={productReviews} />
      )}

      <ReviewModal
        modal={isReviewModalOpen}
        setModal={setIsReviewModalOpen}
        productState={productState}
        refetch={refetch}
      />
    </>
  );
};

const ProductsDetailPage = ({ slug }) => {
  const router = useRouter();
  const { isAuthenticated, userData } = useUser();
  const [productVariant, setProductVariant] = useState(null);
  const { cart } = useContext(CartContext);
  const viewContentTrackedRef = useRef(null);

  const handleVariantChange = useCallback((variant) => {
    setProductVariant(variant);
  }, []);

  // 1. Data fetching
  //    queryParams is memoised so the query key is stable between renders.
  const queryParams = useMemo(
    () => ({ slug, productVariant }),
    [slug, productVariant]
  );

  const { data, isError, refetch } = useProductCore(slug, productVariant);

  const isDataReady = Boolean(data?.success && data?.data?.product);

  // 2. Derived read-only data — taken directly from query result, no local copies.
  const apiData = isDataReady ? data.data : null;
  const availableOffers = Array.isArray(apiData?.availableOffers) ? apiData.availableOffers : [];
  const availableCoupons = Array.isArray(apiData?.availableCoupons) ? apiData.availableCoupons : [];
  const crossSaleProducts = Array.isArray(apiData?.crossSale) ? apiData.crossSale : [];
  const productFaqs = Array.isArray(apiData?.product?.faqs) ? apiData.product.faqs : [];

  // Section 3 related things used generally in states:
  const canReview = isAuthenticated && Boolean(apiData?.canReview);
  const reviewEligibility = apiData?.reviewEligibility;

  // 3. Interactive / user-driven state.
  //    productState.product is set by the effect below; all user-driven
  //    fields (productQty, selectedVariation, etc.) survive background refetches.


  // old code 
  // const [productState, setProductState] = useState({
  //   product: null,
  //   attributeValues: [],
  //   productQty: 1,
  //   selectedVariation: null,
  //   variantIds: [],
  //   orderDetails: {},
  //   currentTheme: {},
  // });

  // new code for h1 missing 
  const [productState, setProductState] = useState(() => {
    // Read the server-prefetched React Query data on the first render.
    const initialData =
      data?.success && data?.data?.product ? data.data : null;

    const initialProduct = initialData?.product || null;
    const initialVariants = initialProduct?.productVariants || [];

    return {
      product: initialProduct,
      attributeValues: [],
      productQty: 1,
      selectedVariation:
        initialData?.selectedVariant ||
        selectDefaultVariant(initialVariants),
      variantIds: [],
      orderDetails: initialData?.orderDetails || {},
      currentTheme: initialData?.theme || {},
    };
  });

  // Sync query data into productState whenever a successful response arrives.
  useEffect(() => {
    if (!isDataReady) return;

    const product = data.data.product;
    const productReviews = data.data.productReviews;
    const orderDetails = data.data.orderDetails;
    const currentTheme = cart?.theme || {};
    const variants = product.productVariants || [];

    const variantFromUrl = productVariant
      ? variants.find((v) => {
        const rv = getVariantRouteValue(v);
        return rv && String(rv) === String(productVariant);
      })
      : null;

    setProductState((prev) => {
      // Preserve user's current selection when the same uid still exists
      // (e.g. background refetch after returning to the tab).
      const preserved = prev.selectedVariation
        ? variants.find((v) => v.uid === prev.selectedVariation.uid)
        : null;

      return {
        ...prev,
        product,
        currentTheme: {
          ...currentTheme,
        },
        orderDetails,
        selectedVariation: variantFromUrl || preserved || selectDefaultVariant(variants),
      };
    });
    // data changes when the query refetches; productVariant changes on URL update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, productVariant]);

  useEffect(() => {
    if (!productState.product || !productState.selectedVariation) return;

    const product = productState.product;
    const variant = productState.selectedVariation;

    const variantId = variant.uid || variant.skuCode;
    if (!variantId) return;

    // Prevent duplicate ViewContent events for the same variant
    if (viewContentTrackedRef.current === variantId) return;

    const unitPrice = Number(variant.disPrice ?? variant.mrp ?? 0);
    const categoryName =
      product.category?.name ||
      product.department?.name ||
      '';

    trackMetaEvent('ViewContent', {
      content_ids: [String(variantId)],
      content_type: 'product',
      content_name: product.name,
      content_category: categoryName || undefined,
      value: unitPrice,
      currency: 'INR',
      contents: [
        {
          id: String(variantId),
          quantity: 1,
          item_price: unitPrice,
        },
      ],
    });

    viewContentTrackedRef.current = variantId;
  }, [productState.product, productState.selectedVariation]);

  // 4. UI state.
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // 5. Tabs derived from productState.product (or prefetched data).
  const resolvedTabs = useMemo(() => {
    const p = productState.product || data?.data?.product;
    if (!p) return [];

    return [
      { key: 'description', label: 'Description', content: p.description },
      { key: 'benefits', label: 'Benefits', content: p.benefits },
      { key: 'ingredients', label: 'Ingredients', content: p.ingredients },
      { key: 'indication', label: 'Indication', content: p.indication },
      { key: 'dosage', label: 'Dosage', content: p.dosage },
      { key: 'caution', label: 'Caution', content: p.caution },
      { key: 'availability', label: 'Availability', content: p.availability },
      {
        key: 'productMarketAuth',
        label: 'Market Authorization',
        content: buildMarketAuthHtml(p.productMarketAuth, p.name || ''),
      },
    ].filter((tab) => {
      if (tab.key === 'productMarketAuth') {
        return Array.isArray(p.productMarketAuth) || p.productMarketAuth !== undefined;
      }
      return hasRenderableContent(tab.content);
    });
  }, [productState.product, data?.data?.product]);

  useEffect(() => {
    if (!resolvedTabs.length) {
      setActiveTab('');
      return;
    }
    // Check if URL hash matches any tab on initial load
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#(product-tab-|product-tabpanel-|tab-|tabpanel-)?/, '');
      if (resolvedTabs.some((t) => t.key === hash)) {
        setActiveTab(hash);
        return;
      }
    }
    setActiveTab((prev) => {
      if (prev && resolvedTabs.some((t) => t.key === prev)) return prev;
      return resolvedTabs[0].key;
    });
  }, [resolvedTabs]);

  const effectiveActiveTab =
    (activeTab && resolvedTabs.some((t) => t.key === activeTab))
      ? activeTab
      : (resolvedTabs[0]?.key || '');

  const handleTabKeyDown = useCallback((e, currentIndex) => {
    let targetIndex = null;
    if (e.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % resolvedTabs.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + resolvedTabs.length) % resolvedTabs.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = resolvedTabs.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      const targetTab = resolvedTabs[targetIndex];
      if (targetTab) {
        setActiveTab(targetTab.key);
        const button = document.getElementById(`product-tab-${targetTab.key}`);
        button?.focus();
      }
    }
  }, [resolvedTabs]);

  // 6. Sticky cart scroll listener.
  useEffect(() => {
    const handleScroll = () => {
      const button = document.querySelector('.scroll-button');
      if (!button) return;
      const { bottom } = button.getBoundingClientRect();
      document.body.classList.toggle('stickyCart', bottom < window.innerHeight && bottom < 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('stickyCart');
    };
  }, []);

  // 7. Not-found redirect (never fires while still loading).
  const shouldRedirectToNotFound =
    isError || !data?.success || !data?.data?.product;

  useEffect(() => {
    if (shouldRedirectToNotFound) router.replace('/not-found');
  }, [router, shouldRedirectToNotFound]);

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
    } else if (canReview) {
      setIsReviewModalOpen(true);
    } else if (reviewEligibility?.hasReviewed) {
      ToastNotification('info', 'You have already reviewed this product');
    } else if (!reviewEligibility?.hasPurchased) {
      ToastNotification('info', 'Buy this product to review it');
    } else {
      ToastNotification(
        'info', 'Buy this product to review it'
      );
    }
  };

  // 9. Render guard — show skeleton while loading OR during the single-render
  //    gap between query data arriving and the useEffect populating productState.
  //    This prevents children from ever receiving a null product object.
  const showSkeleton = isDataReady && !productState.product;

  if (showSkeleton) return <ProductDetailSkeleton />;
  if (shouldRedirectToNotFound) return null;

  const isDoctorProduct = productState.product?.customerType === 'doctor';
  const isVerifiedDoctor = isAuthenticated && userData?.isDoctor === true;

  // console.log("Product Reviews", productState.productReviews)

  // 10. Full render.
  return (
    <>
      <Suspense fallback={null}>
        <VariantListener onVariantChange={handleVariantChange} />
      </Suspense>

      <WrapperComponent
        classes={{ sectionClass: 'product-section section-b-space pt-0' }}
        noRowCol={true}
      >
        <Row>
          <Col xs={12}>
            <nav className={styles['pdp-breadcrumb']} aria-label="Breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/" aria-label="Home">Home</a></li>
                <li className="breadcrumb-item"><a href="/collections">Products Range</a></li>
                <li className="breadcrumb-item active text-capitalize">
                  {productState.product?.name || slug}
                </li>
              </ol>
            </nav>
          </Col>
        </Row>

        <Row className={`${styles['prod-info-wrapper']} g-3`}>
          <Col xl={6} style={{ overflow: 'clip' }}>
            <div className={styles['pdp-gallery-sticky']}>
              <Row>
                <ProductThumbnailSlider productState={productState} slug={slug} />
              </Row>
            </div>
          </Col>

          <Col xl={6}>
            <ProductDetailsContent
              productState={productState}
              setProductState={setProductState}
              availableOffers={availableOffers}
              availableCoupons={availableCoupons}
              isDoctorProduct={isDoctorProduct}
              isVerifiedDoctor={isVerifiedDoctor}
            />
          </Col>
        </Row>
      </WrapperComponent>

      <WrapperComponent
        classes={{
          sectionClass: `section-b-space ${styles['details-trending-section']}`,
        }}
        noRowCol={true}
      >
        <Row className="g-4 g-md-5">
          <Col xl={12}>
            <div className={styles['details-card']}>
              <h2 className={styles['details-title']}>Product Details</h2>

              {resolvedTabs.length > 0 && (
                <div className={styles['details-content']}>
                  <div className={styles['tabs-scroll-wrap']}>
                    <div
                      className={styles['tabs-list']}
                      role="tablist"
                      aria-label="Product details tabs"
                    >
                      {resolvedTabs.map((tab, index) => {
                        const isSelected = effectiveActiveTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            id={`product-tab-${tab.key}`}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls={`product-tabpanel-${tab.key}`}
                            tabIndex={isSelected ? 0 : -1}
                            className={`${styles['tab-btn']} ${isSelected ? styles['tab-btn-active'] : ''
                              }`}
                            onClick={() => setActiveTab(tab.key)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                          >
                            <h3 style={{ fontSize: 'inherit' }}>
                              {tab.label}
                            </h3>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <noscript>
                    <style>{`
                      [role="tabpanel"][hidden] {
                        display: block !important;
                      }
                    `}</style>
                  </noscript>

                  <div className={styles['tabs-panels-container']}>
                    {resolvedTabs.map((tab) => {
                      const isSelected = effectiveActiveTab === tab.key;
                      return (
                        <div
                          key={tab.key}
                          id={`product-tabpanel-${tab.key}`}
                          role="tabpanel"
                          aria-labelledby={`product-tab-${tab.key}`}
                          tabIndex={0}
                          hidden={!isSelected}
                          className={`${styles['tab-panel']} ${isSelected ? styles['tab-panel-active'] : styles['tab-panel-hidden']
                            }`}
                        >
                          <div className={isSelected ? styles['tab-fade'] : undefined}>
                            <div
                              className={styles['tab-content-html']}
                              dangerouslySetInnerHTML={{ __html: tab.content }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Col>

          <Col xl={12}>
            <Suspense fallback={<div className="skeleton-shimmer" style={{ height: '300px', width: '100%' }} />}>
              <RelatedProductsSection slug={slug} productVariant={productVariant} />
            </Suspense>
          </Col>
        </Row>
      </WrapperComponent>

      {productFaqs.length > 0 && (
        <FaqSection
          faqs={productFaqs}
          showPageHeader={false}
          title="Frequently Asked Questions"
          description="Find quick answers about this product, ordering, and delivery."
          className={`${styles['details-faq-section']} section-t-space`}
        />
      )}

      <Suspense fallback={<div className="skeleton-shimmer" style={{ height: '500px', width: '100%', marginTop: '30px' }} />}>
        <ProductReviewsSection
          slug={slug}
          productVariant={productVariant}
          productState={productState}
          isAuthenticated={isAuthenticated}
          canReview={canReview}
          reviewEligibility={reviewEligibility}
          loginModalOpen={loginModalOpen}
          setLoginModalOpen={setLoginModalOpen}
          isReviewModalOpen={isReviewModalOpen}
          setIsReviewModalOpen={setIsReviewModalOpen}
          refetch={refetch}
        />
      </Suspense>

      <BestSellerProducts
        products={crossSaleProducts}
        title="People Also Bought These"
        subTitle="Explore more products that our customers love"
        viewAllHref="/collections"
        viewAllText="View All"
        fetchFromHome={false}
        useFallback={false}
      />

      {productState.product?.metaKeywords && productState.product.metaKeywords.length > 0 && (
        <KeywordsSection keywords={productState.product.metaKeywords} />
      )}

      {productState.product?.uid && (
        <StickyCheckout
          productState={productState}
          setProductState={setProductState}
          isDoctorProduct={isDoctorProduct}
          isVerifiedDoctor={isVerifiedDoctor}
        />
      )}

      <OtpLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        setOpen={setLoginModalOpen}
      />
    </>
  );
};

export default ProductsDetailPage;
