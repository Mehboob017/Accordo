const ProductBadge = ({ productDetail }) => {
  const firstTagName = productDetail?.tags?.[0]?.name;

  return (
    <>
      {firstTagName && (
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
      ) : null}
    </>
  );
};

export default ProductBadge;