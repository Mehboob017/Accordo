'use client';

import { useRouter } from 'next/navigation';
import { RiLeafLine, RiArrowRightSLine } from 'react-icons/ri';

const HerbCard = ({ herb, viewMode = 'grid' }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/herbs/${herb.slug}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    router.push(`/herbs/${herb.slug}`);
  };

  return (
    <div
      className="herb-card herb-card--grid"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="herb-card__image-container">
        <img
          src={herb.coverImage || '/assets/images/logo/1.png'}
          alt={herb.coverImageAlt || herb.name}
          className="herb-card__image"
          loading="lazy"
        />
      </div>

      <div className="herb-card__content">
        <h6 className="herb-card__title name">{herb.name}</h6>
        {herb.shortDescription && (
          <span className="herb-card__subTitle">
            {herb.shortDescription}
          </span>
        )}
      </div>
        <button className="herb-card__button btn-primary" onClick={handleButtonClick}>
          View Details
          <RiArrowRightSLine className="button-icon" />
        </button>
    </div>
  );
};

export default HerbCard;
