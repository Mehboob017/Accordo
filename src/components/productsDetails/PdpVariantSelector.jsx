'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const convertToRupees = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '';
  return `₹ ${amount.toFixed(2)}`;
};

/**
 * Variant card selector for the new PDP (/products/[slug]).
 * Consumes raw camelCase productVariants — does NOT rely on normalizeProduct output.
 */
const PdpVariantSelector = ({
  productState,
  setProductState,
  // --- New Pricing Props ---
  isDoctorProduct,
  isVerifiedDoctor
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const product = productState?.product || {};
  const selectedVariation = productState?.selectedVariation;
  const variants = product.productVariants || [];

  const getVariantRouteValue = (variant) => variant?.slug || '';

  const handleVariantSelect = (variant) => {
    if (!variant.inStockFlag) return;

    const routeVariant = getVariantRouteValue(variant);
    const currentVariant = searchParams?.get('productVariant') || '';
    const nextParams = new URLSearchParams(searchParams?.toString());

    if (routeVariant) {
      nextParams.set('productVariant', routeVariant);
    } else {
      nextParams.delete('productVariant');
    }

    const nextUrl = `${pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;

    setProductState((prev) => ({
      ...prev,
      selectedVariation: variant,
      variantImageRequestedAt: Date.now(),
    }));

    if (routeVariant !== currentVariant) {
      router.push(nextUrl, { scroll: false });
    }
  };

  if (!variants.length) return null;

  return (
    <div className="pickup-box">
      <div className="product-info">
        <fieldset className="variation-fieldset">
          <legend className="variation-availability-label fw-semibold">
            Availability: Net Quantity
          </legend>

          <div className="variation-radio-list">
            {variants.map((variant) => {
              const label =
                variant?.name ||
                (variant.weight ? String(variant.weight) : '-') +
                (variant.unit ? ` ${variant.unit}` : '') ||
                '-';

              const mrp = variant?.mrp ?? 0;
              const disPrice = variant?.disPrice ?? mrp;

              const discount =
                variant?.discount ||
                (mrp > 0 && disPrice < mrp
                  ? Math.round(((mrp - disPrice) / mrp) * 100)
                  : 0);

              const inStock = variant.inStockFlag;
              const isSelected = selectedVariation?.uid === variant.uid;

              return (
                <button
                  type="button"
                  key={variant.uid}
                  className={`variation-radio-card ${isSelected ? 'active' : ''
                    } ${!inStock ? 'disabled' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={!inStock}
                  aria-pressed={isSelected}
                >
                  <div className="variation-radio-content">
                    <div className="variation-radio-pricing">
                      <span className="variation-price-strong" title={label}>
                        {label}
                      </span>

                      <span
                        className={`variation-radio-stock ${inStock ? 'in-stock' : 'out-of-stock'
                          }`}
                      >
                        {inStock ? 'In stock' : 'Out of stock'}
                      </span>
                    </div>

                    <div className="variation-radio-bottom price-row d-flex align-items-center gap-2 mt-1 mb-0">
                      {isDoctorProduct && !isVerifiedDoctor ? (
                        <div className="disc-price variation-price-discount">
                          <span
                            style={{
                              fontSize: 14,
                              color: '#6f6f6f',
                              lineHeight: 1,
                            }}
                          >
                            M.R.P.
                          </span>{' '}
                          {convertToRupees(mrp)}
                        </div>
                      ) : (
                        <>
                          <div className="disc-price variation-price-discount">
                            {convertToRupees(disPrice)}
                          </div>

                          {mrp !== disPrice && (
                            <>
                              <div
                                className="selling-price"
                                style={{ textDecoration: 'lineThrough' }}
                              >
                                <span
                                  style={{
                                    fontSize: 14,
                                    color: '#6f6f6f',
                                    lineHeight: 1,
                                  }}
                                >
                                  M.R.P.
                                </span>{' '}
                                {convertToRupees(mrp)}
                              </div>

                              <div className="percent-off">
                                {discount ? `${discount}% Off` : null}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
    // <div className="pickup-box">
    //   <div className="product-info">
    //     <div className="variation-availability-summary">
    //       <span className="variation-availability-label">
    //         <h4>Availability: Net Quantity</h4>
    //       </span>
    //     </div>

    //     <div className="variation-radio-list">
    //       {variants.map((variant) => {
    //         const label =
    //           variant?.name ||
    //           (variant.weight ? String(variant.weight) : '-') +
    //           (variant.unit ? ` ${variant.unit}` : '') ||
    //           '-';

    //         // --- Extract pricing values ---
    //         const mrp = variant?.mrp ?? 0;
    //         const disPrice = variant?.disPrice ?? mrp;
    //         // Use provided discount or calculate it as a fallback
    //         const discount =
    //           variant?.discount ||
    //           (mrp > 0 && disPrice < mrp
    //             ? Math.round(((mrp - disPrice) / mrp) * 100)
    //             : 0);

    //         const inStock = variant.inStockFlag;
    //         const isSelected = selectedVariation?.uid === variant.uid;

    //         return (
    //           <button
    //             type="button"
    //             key={variant.uid}
    //             className={`variation-radio-card ${isSelected ? 'active' : ''} ${!inStock ? 'disabled' : ''}`}
    //             onClick={() => handleVariantSelect(variant)}
    //             disabled={!inStock}
    //             aria-pressed={isSelected}
    //           >
    //             <div className="variation-radio-content">
    //               <div className="variation-radio-pricing">
    //                 <span className="variation-price-strong" title={label}>
    //                   {label}
    //                 </span>
    //                 <span
    //                   className={`variation-radio-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}
    //                 >
    //                   {inStock ? 'In stock' : 'Out of stock'}
    //                 </span>
    //               </div>

    //               {/* --- Updated Pricing Logic Block --- */}
    //               <div className="variation-radio-bottom price-row d-flex align-items-center gap-2 mt-1 mb-0">
    //                 {isDoctorProduct ? (
    //                   isVerifiedDoctor ? (
    //                     // CASE 1: Doctor Product + Verified Doctor
    //                     <>
    //                       <div className="disc-price variation-price-discount">
    //                         {convertToRupees(disPrice)}
    //                       </div>
    //                       {mrp !== disPrice && (
    //                         <>
    //                           <div
    //                             className="selling-price"
    //                             style={{ textDecoration: 'lineThrough' }}
    //                           >
    //                             <span
    //                               style={{
    //                                 fontSize: 14,
    //                                 color: '#6f6f6f',
    //                                 lineHeight: 1,
    //                               }}
    //                             >
    //                               M.R.P.
    //                             </span>{' '}
    //                             {convertToRupees(mrp)}
    //                           </div>
    //                           <div className="percent-off">
    //                             {discount ? `${discount}% Off` : null}
    //                           </div>
    //                         </>
    //                       )}
    //                     </>
    //                   ) : (
    //                     // CASE 2: Doctor Product + Unverified User (ONLY MRP SHOWS)
    //                     <div className="disc-price variation-price-discount">
    //                       <span
    //                         style={{
    //                           fontSize: 14,
    //                           color: '#6f6f6f',
    //                           lineHeight: 1,
    //                         }}
    //                       >
    //                         M.R.P.
    //                       </span>{' '}
    //                       {convertToRupees(mrp)}
    //                     </div>
    //                   )
    //                 ) : (
    //                   // CASE 3: Regular Product
    //                   <>
    //                     <div className="disc-price variation-price-discount">
    //                       {convertToRupees(disPrice)}
    //                     </div>
    //                     {mrp !== disPrice && (
    //                       <>
    //                         <div
    //                           className="selling-price"
    //                           style={{ textDecoration: 'lineThrough' }}
    //                         >
    //                           <span
    //                             style={{
    //                               fontSize: 14,
    //                               color: '#6f6f6f',
    //                               lineHeight: 1,
    //                             }}
    //                           >
    //                             M.R.P.
    //                           </span>{' '}
    //                           {convertToRupees(mrp)}
    //                         </div>
    //                         <div className="percent-off">
    //                           {discount ? `${discount}% Off` : null}
    //                         </div>
    //                       </>
    //                     )}
    //                   </>
    //                 )}
    //               </div>
    //               {/* --- End Updated Pricing Logic Block --- */}
    //             </div>
    //           </button>
    //         );
    //       })}
    //     </div>
    //   </div>
    // </div>
  );
};

export default PdpVariantSelector;