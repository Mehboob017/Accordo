'use client';

import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Journal Publications', href: '/resources/journal-publication' },
  // { label: 'SDL Publications', href: '/resources/sdl-publication' },
  // { label: 'Preclinical Studies', href: '/resources/preclinical-studies' },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="tabs-nav" aria-label="Resources navigation">
      <ul className="tabs-list hide-scrollbar" data-lenis-prevent>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <li
              key={tab.href}
              className={`tabs-item ${isActive ? 'is-active' : ''}`}
            >
              <a
                href={tab.href}
                className="tabs-link"
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="tabs-link-inner">
                  <span className="tabs-label">{tab.label}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
