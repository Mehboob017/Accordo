'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useHeaderMenu } from '@/utils/hooks/useHeaderMenu';
import styles from './TopbarMarquee.module.scss';

const DEFAULT_MESSAGES = [
  { title: 'Free shipping across India on orders above ₹499' },
  { title: '100% Authentic & Certified Ayurvedic Formulations' },
  { title: 'Use code AYUSH10 for extra 10% OFF' },
  { title: 'Expert Ayurvedic Doctor Consultation Available' },
];

const ensureMinItems = (list, minCount = 5) => {
  if (!list || list.length === 0) return [];
  let result = [...list];
  while (result.length < minCount) {
    result = [...result, ...list];
  }
  return result;
};

const TopbarMarquee = ({
  messages,
  customClass,
  className,
  speed = 35,
  pauseOnHover = true,
  separator = '✦',
}) => {
  const { topBar } = useHeaderMenu();

  const rawItems = useMemo(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      return messages;
    }
    if (Array.isArray(topBar) && topBar.length > 0) {
      return topBar;
    }
    return DEFAULT_MESSAGES;
  }, [messages, topBar]);

  const displayItems = useMemo(() => {
    return ensureMinItems(rawItems, 6);
  }, [rawItems]);

  const renderItem = (item, idx) => {
    const title = typeof item === 'string' ? item : item?.title || '';
    const link = typeof item === 'object' ? item?.link || item?.path || item?.url : null;

    if (!title) return null;

    return (
      <span key={idx} className={styles.marqueeItem}>
        {link ? (
          <Link href={link}>{title}</Link>
        ) : (
          <span>{title}</span>
        )}
        <span className={styles.separator} aria-hidden="true">
          {separator}
        </span>
      </span>
    );
  };

  const wrapperClass = [
    styles.marqueeWrapper,
    pauseOnHover ? styles.pauseOnHover : '',
    customClass || '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={wrapperClass}
      style={{ '--marquee-speed': `${speed}s` }}
      role="region"
      aria-label="Announcements"
    >
      <div className={styles.marqueeTrack}>
        <div className={styles.marqueeGroup}>
          {displayItems.map((item, index) => renderItem(item, `primary-${index}`))}
        </div>
        <div className={styles.marqueeGroup} aria-hidden="true">
          {displayItems.map((item, index) => renderItem(item, `clone-${index}`))}
        </div>
      </div>
    </div>
  );
};

export default TopbarMarquee;
