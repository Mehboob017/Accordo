import { formatDate, getOptimizedCdnImageUrl } from '@/utils/helpers';
import { RiCalendarLine } from 'react-icons/ri';

export default function PressCard({ item, index, onClick }) {
  return (
    <button
      className="press-card"
      onClick={() => onClick(index)}
      aria-label={`Open press image ${item.name}`}
    >
      <img
        src={getOptimizedCdnImageUrl(item.image, 300, 300, 80)}
        width={300}
        height={300}
        alt={item.imageAlt}
        loading="lazy"
        decoding="async"
      />

      <div className="press-card__overlay">
        {item.name && (
          <h3 className="press-card__title" title={item.name}>
            {item.name}
          </h3>
        )}
        {item.date && (
          <time className="press-card__date">
            {/* <i className="ri-calendar-line theme-color me-2"></i>{' '} */}
            <RiCalendarLine className='theme-color me-2' />
            {formatDate(item.date)}
          </time>
        )}
      </div>
    </button>
  );
}
