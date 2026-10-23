'use client';

import { usePathname } from 'next/navigation';

const HEADER_MAP = {
  '/resources/journal-publication': {
    title: 'Journal Publications',
    subtitle:
      'Explore our research papers, scientific articles, and clinical publications on authentic Ayurvedic formulations and studies.',
  },
  '/resources/sdl-publication-more': {
    title: 'SDL Publications',
    subtitle:
      'Explore our exclusive publications, clinical literature, and reference books on Ayurveda.',
  },
  '/resources/preclinical-studies-more': {
    title: 'Preclinical Studies',
    subtitle:
      'Access comprehensive preclinical research studies, pharmacology assessments, and safety evaluations.',
  },
};

const DEFAULT_HEADER = {
  title: 'Journal Publications',
  subtitle:
    'Explore our research papers, scientific articles, and clinical publications on authentic Ayurvedic formulations and studies.',
};

export default function ResourcesHeader() {
  const pathname = usePathname();
  const header = HEADER_MAP[pathname] || DEFAULT_HEADER;

  return (
    <div className="events-header">
      <h1 className="events-title">{header.title}</h1>
      <h2 className="sr-only">This is a {header.title.toLowerCase()} page.</h2>
      <p className="events-subtitle">{header.subtitle}</p>
    </div>
  );
}
