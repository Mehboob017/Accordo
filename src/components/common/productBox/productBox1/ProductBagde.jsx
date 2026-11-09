import React from 'react';

const ProductBadge = ({ productDetail }) => {
  // const firstTagName = productDetail?.tags?.[0]?.name;

  const deliveryBadge =
    productDetail?.delivery_time ||
    productDetail?.deliveryTime ||
    productDetail?.badge ||
    '60 min*';

  return (
    <>
      <div className="label-tag express-tag">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="express-icon"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>{deliveryBadge}</span>
      </div>

      {/* --- Previous badge logic preserved --- */}
      {/* {firstTagName && (
        <div className="label-tag sale-tag">
          <span>{firstTagName}</span>
        </div>
      )}

      {productDetail?.is_sale_enable ? (
        <div className="label-tag sale-tag">
          <span>Sale</span>
        </div>
      ) : productDetail?.is_featured ? (
        <div className="label-tag featured-tag">
          <span>Featured</span>
        </div>
      ) : null} */}
    </>
  );
};

export default ProductBadge;
