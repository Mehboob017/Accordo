'use client';
import React from 'react';
import Link from 'next/link';
import styles from './KeywordsSection.module.scss';
import WrapperComponent from './WrapperComponent';

const KeywordsSection = ({ keywords = [] }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <WrapperComponent
      noRowCol={true}
      noSectionTopSpace={true}
      classes={{ sectionClass: `${styles.keywordsSection} section-t-space section-b-space` }}
    >
      <nav aria-label="Related keywords">
        <ul className={styles.keywordsList}>
          {keywords.map((keyword, index) => {
            const label = typeof keyword === 'string' ? keyword : keyword.label;
            const url = typeof keyword === 'string' ? null : keyword.url;

            return (
              <li key={index} className={styles.keywordItem}>
                {url ? (
                  <Link prefetch={false} href={url} className={styles.keywordLink} title={label}>
                    {label}
                  </Link>
                ) : (
                  <span className={styles.keywordLabel}>{label}</span>
                )}
                {index < keywords.length - 1 && (
                  <span className={styles.separator} aria-hidden="true">
                    |
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </WrapperComponent>
  );
};

export default KeywordsSection;
