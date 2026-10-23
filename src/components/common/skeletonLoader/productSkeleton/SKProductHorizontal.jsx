const SKProductHorizontal = () => {
  return (
    <div className="skeleton-div">
      <div className="product-box product-box-skeleton-v1 d-flex flex-column h-100 p-0 skeleton">
        <div className="skeleton-badge-placeholder" />

        <div className="product-image">
          <div className="product-image-shell">
            <div className="skeleton-image-placeholder" />
          </div>
        </div>

        <div className="product-detail">
          <div className="product-detail--wrapper">
            <div className="skeleton-name-placeholder" />

            <div className="product-detail-bottom">
              <div className="meta-1">
                <div className="skeleton-meta-left">
                  <div className="skeleton-unit-placeholder" />
                  <div className="skeleton-stock-placeholder" />
                </div>

                <div className="skeleton-meta-right">
                  <div className="skeleton-rating-placeholder" />
                </div>
              </div>

              <div className="price-row">
                <div className="skeleton-disc-price-placeholder" />
                <div className="skeleton-selling-price-placeholder" />
                <div className="skeleton-percent-off-placeholder" />
              </div>

              <div className="skeleton-actions-row">
                <div className="skeleton-action-primary" />
                <div className="skeleton-action-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SKProductHorizontal;
