const SKELETON_ITEMS = 6;

export default function FaqPageSkeleton() {
  return (
    <>
      <section className="faq-box-contain section-b-space">
        {/* Categories skeleton (just layout, icons are part of FaqCategory itself) */}
        <div className="container-fluid-lg category-slider">
          <div className="skeleton skeleton--category-strip my-2" />
        </div>

        <div className="container-fluid-lg">
          <div className="row">
            <div className="col-xl-5">
              <div className="faq-contain">
                <div className="skeleton skeleton--text-lg" />
                <div className="skeleton skeleton--text-sm mt-2" />
                <div className="skeleton skeleton--text-sm mt-1" />
              </div>
            </div>
            <div className="col-xl-7">
              <div className="faq-accordion">
                {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
                  <div key={index} className="faq-skeleton-item">
                    <div className="skeleton skeleton--accordion-header" />
                    <div className="skeleton skeleton--accordion-body mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
