'use client';

import {
  FaThLarge,
  FaShippingFast,
  FaCreditCard,
  FaUserCircle,
  FaUndoAlt,
} from 'react-icons/fa';
import styles from './FaqCategory.module.scss';

const getCategoryIcon = (index) => {
  if (index === 0) return <FaThLarge />;

  const icons = [FaUndoAlt, FaShippingFast, FaCreditCard, FaUserCircle];
  const Icon = icons[(index - 1) % icons.length];
  return <Icon />;
};

const FaqCategory = ({ categories, activeCategoryUid, onChangeCategory }) => {
  const allCategory = { uid: null, name: 'All' };
  const list = [allCategory, ...(categories || [])];

  return (
    <div className="container-fluid-lg category-slider">
      <div>
        <nav className={`${styles.categoryNav} hide-scrollbar`}>
          <ul className={styles.categoryList} data-lenis-prevent>
            {list.map((category, index) => {
              const isActive =
                (!activeCategoryUid && category.uid === null) ||
                activeCategoryUid === category.uid;

              return (
                <li key={category.uid ?? 'all'}>
                  <button
                    type="button"
                    className={`${styles.categoryItem} ${
                      isActive ? styles.active : ''
                    }`}
                    onClick={() => onChangeCategory?.(category.uid || null)}
                  >
                    {/* <span className={styles.categoryIcon}>
                      {getCategoryIcon(index)}
                    </span> */}
                    <span>{category.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default FaqCategory;
