import { Col, Row } from 'reactstrap';

const SkCheckout = () => {
  return (
    <div className="pb-4 checkout-section-2 checkout-skeleton">
      <Row className="g-sm-4 g-3">
        {/* Left column - form area */}
        <Col xxl="8" xl="7">
          <div className="left-sidebar-checkout">
            <div className="checkout-detail-box">
              <ul className="list-unstyled">
                {/* Login prompt skeleton */}
                <li className="skeleton skeleton-checkout-card">
                  <div className="skeleton__header" style={{ width: '60%' }} />
                  <div className="skeleton__p" />
                  <div className="skeleton__p" style={{ width: '40%' }} />
                </li>
                {/* Delivery address card skeleton */}
                <li className="skeleton skeleton-checkout-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="skeleton__header" style={{ width: 140 }} />
                    <div className="skeleton__header skeleton__p--short" style={{ width: 80, height: 24 }} />
                  </div>
                  <div className="skeleton__p" />
                  <div className="skeleton__p" />
                  <div className="skeleton__p" style={{ width: '70%' }} />
                </li>
              </ul>
            </div>
          </div>
        </Col>

        {/* Right column - sidebar */}
        <Col xxl="4" xl="5">
          <div className="skeleton pos-detail-card p-3 rounded">
            <div className="title-header mb-3">
              <div className="skeleton__header" style={{ width: 120, height: 28 }} />
            </div>
            {/* Product list skeleton */}
            <div className="mb-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="d-flex gap-2 mb-3 skeleton">
                  <div className="skeleton__img" style={{ width: 56, height: 56, minWidth: 56 }} />
                  <div className="flex-grow-1">
                    <div className="skeleton__p" style={{ marginBottom: 6 }} />
                    <div className="skeleton__p" style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Coupon area skeleton */}
            <div className="mb-3">
              <div className="skeleton__p" style={{ width: '80%', marginBottom: 8 }} />
              <div className="skeleton__header" style={{ width: '100%', height: 44 }} />
            </div>
            {/* Order summary skeleton */}
            <div className="mb-3">
              <div className="skeleton__p" />
              <div className="skeleton__p" />
              <div className="skeleton__p" />
              <div className="skeleton__p" style={{ width: '60%' }} />
            </div>
            {/* Place order button skeleton */}
            <div className="skeleton__header" style={{ width: '100%', height: 48, marginTop: 8 }} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SkCheckout;
