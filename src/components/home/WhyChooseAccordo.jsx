'use client';

import React from 'react';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import styles from './WhyChooseAccordo.module.scss';

// ── Feature Icons matching design ───────────────────────────────────────────
const ZapIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BoxesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2.5" width="8" height="8" rx="1.5" />
    <rect x="2.5" y="13.5" width="8" height="8" rx="1.5" />
    <rect x="13.5" y="13.5" width="8" height="8" rx="1.5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 11 14 15 10" />
  </svg>
);

const DEFAULT_FEATURES = [
  {
    id: 'fast-delivery',
    icon: ZapIcon,
    title: '60 MINS\nDELIVERY',
  },
  {
    id: 'wide-range',
    icon: BoxesIcon,
    title: 'WIDE RANGE OF\nPRODUCTS',
  },
  {
    id: 'trusted',
    icon: ShieldCheckIcon,
    title: 'TRUSTED &\nGENUINE',
  },
  {
    id: 'b2b-b2c',
    icon: UsersIcon,
    title: 'B2B & B2C AT\nSAME PLATFORM',
  },
  {
    id: 'secured',
    icon: CheckCircleIcon,
    title: 'SECURED &\nHASSLE-FREE',
  },
];

const WhyChooseAccordo = ({
  title = 'WHY CHOOSE ACCORDO.AI',
  subTitle = 'Find the right electrical supplies for every project.',
  features = DEFAULT_FEATURES,
  svgUrl,
}) => {
  if (!features || !features.length) return null;

  return (
    <WrapperComponent
      classes={{ sectionClass: `${styles['why-choose-section']} section-b-space` }}
      noRowCol={true}
    >
      {/* ── Section Header ── */}
      <div className={styles['heading-wrapper']}>
        <CustomHeading
          customClass="mb-0 text-center"
          title={title}
          subTitle={subTitle}
          svgUrl={svgUrl}
        />
      </div>

      {/* ── 5 Feature Bubbles Grid/Flex ── */}
      <div className={styles['features-container']}>
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={styles['feature-card']}>
              <div className={styles['icon-bubble']}>
                <Icon />
              </div>
              <h3 className={styles['label']}>
                {item.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h3>
            </div>
          );
        })}
      </div>
    </WrapperComponent>
  );
};

export default WhyChooseAccordo;
