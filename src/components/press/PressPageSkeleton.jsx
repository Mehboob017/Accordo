import WrapperComponent from '../common/WrapperComponent';

const CARD_COUNT = 12;

export default function PressPageSkeleton() {
  return (
    <WrapperComponent
      classes={{
        sectionClass: 'section-b-space press-main-section',
      }}
    >
      <div className="press-page">
        <div className="press-content-section">
          <div className="press-page">
            <section className="press-page__content">
              <div className="press-grid press-page-skeleton__grid">
                {Array.from({ length: CARD_COUNT }).map((_, index) => (
                  <div key={index} className="press-card press-card-skeleton" aria-hidden="true">
                    <div className="press-card-skeleton__image skeleton" />

                    <div className="press-card__overlay press-card-skeleton__overlay">
                      <div className="press-card-skeleton__title skeleton" />

                      <div className="press-card-skeleton__date-row">
                        <div className="press-card-skeleton__date-icon skeleton" />
                        <div className="press-card-skeleton__date-text skeleton" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </WrapperComponent>
  );
}
