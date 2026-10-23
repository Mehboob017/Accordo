const OrderDetailsOffcanvasSkeleton = () => {
  return (
    <div className="order-details-skeleton" style={{ minHeight: '560px', opacity: 0.4 }}>
      <div className="placeholder-glow mb-3">
        <span className="placeholder col-7" style={{ height: '38px' }} />
      </div>

      <div className="placeholder-glow mb-3">
        <span className="placeholder col-5" style={{ height: '18px' }} />
      </div>

      <ul className="list-unstyled mb-4" style={{ minHeight: '210px' }}>
        {[1, 2, 3].map((item) => (
          <li className="d-flex align-items-center gap-3 mb-3" key={item}>
            <span
              className="placeholder"
              style={{ width: '64px', height: '64px', borderRadius: '10px' }}
            />
            <div className="flex-grow-1 placeholder-glow">
              <span className="placeholder col-7 d-block mb-2" style={{ height: '14px' }} />
              <span className="placeholder col-4 d-block" style={{ height: '12px' }} />
            </div>
            <div className="placeholder-glow" style={{ width: '70px' }}>
              <span className="placeholder col-12" style={{ height: '14px' }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="placeholder-glow mb-4" style={{ minHeight: '130px' }}>
        <span className="placeholder col-6 d-block mb-3" style={{ height: '16px' }} />
        <span className="placeholder col-12 d-block mb-2" style={{ height: '12px' }} />
        <span className="placeholder col-10 d-block mb-2" style={{ height: '12px' }} />
        <span className="placeholder col-8 d-block mb-2" style={{ height: '12px' }} />
        <span className="placeholder col-7 d-block" style={{ height: '14px' }} />
      </div>

      <div className="placeholder-glow" style={{ minHeight: '120px' }}>
        <span className="placeholder col-5 d-block mb-3" style={{ height: '16px' }} />
        <span className="placeholder col-12 d-block mb-2" style={{ height: '12px' }} />
        <span className="placeholder col-11 d-block mb-2" style={{ height: '12px' }} />
        <span className="placeholder col-9 d-block" style={{ height: '12px' }} />
      </div>
    </div>
  );
};

export default OrderDetailsOffcanvasSkeleton;
