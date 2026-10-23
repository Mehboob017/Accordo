'use client';

import styles from './ProductsDetailPage.module.scss';

const ProductDetailSkeleton = () => (
  <section className={`section-b-space ${styles['product-detail-page']}`}>
    <div className="container-fluid-lg">
      <div className={styles['skeleton-wrapper']}>
        <div className={`${styles['skeleton']} ${styles['skeleton-breadcrumb']}`} />
        <div className={styles['skeleton-main']}>
          <div className={styles['skeleton-gallery']}>
            <div className={`${styles['skeleton']} ${styles['skeleton-main-image']}`} />
            <div className={styles['skeleton-thumbs']}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${styles['skeleton']} ${styles['skeleton-thumb']}`} />
              ))}
            </div>
          </div>
          <div className={styles['skeleton-info']}>
            <div className={`${styles['skeleton']} ${styles['skeleton-title']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-rating']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-price']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-line']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-line']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-line']} ${styles['skeleton-line-short']}`} />
            <div className={`${styles['skeleton']} ${styles['skeleton-button']}`} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ProductDetailSkeleton;
