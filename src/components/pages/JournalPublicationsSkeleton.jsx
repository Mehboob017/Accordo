const CARD_COUNT = 12;

const JournalPublicationsSkeleton = () => {
  return (
    <div className="journal-publications-skeleton">
      <div className="row g-sm-4 g-3">
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <div key={index} className="col-6 col-md-4 col-xl-3">
            <div className="publication-card skeleton">
              <div className="publication-card-inner">
                <div className="skeleton__img" />
                <div className="skeleton__section">
                  <div className="skeleton__p" />
                  <div className="skeleton__p skeleton__p--short" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalPublicationsSkeleton;
