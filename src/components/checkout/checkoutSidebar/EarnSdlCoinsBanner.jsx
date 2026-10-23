'use client';

import { RiCopperCoinLine, RiSparklingLine } from 'react-icons/ri';
import styles from './EarnSdlCoinsBanner.module.scss';

const EarnSdlCoinsBanner = ({ totalCoins = 0 }) => {
  const safeTotalCoins = Math.max(0, Number(totalCoins) || 0);

  if (safeTotalCoins <= 0) {
    return null;
  }

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerGlow} />
      <div className={styles.bannerContent}>
        <div className={styles.bannerLeft}>
          <div className={styles.title}>
            Earn <RiSparklingLine size={16} className={styles.sparkIcon} />{' '}
            {safeTotalCoins} SDL Points with this order
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarnSdlCoinsBanner;
