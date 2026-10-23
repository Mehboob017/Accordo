'use client';

export default function CompanyDocumentsTabs({
  tabs,
  activeTab,
  onChange,
}) {
  return (
    <nav
      className="tabs-nav"
      aria-label="Financial Year"
    >
      <ul
        className="tabs-list hide-scrollbar"
        data-lenis-prevent
      >
        {tabs.map((tab) => {
          const active = tab.uid === activeTab;

          return (
            <li
              key={tab.uid}
              className={`tabs-item ${active ? 'is-active' : ''}`}
            >
              <button
                type="button"
                className="tabs-link border-0 bg-transparent"
                onClick={() => onChange(tab.uid)}
              >
                <span className="tabs-link-inner">
                  <span className="tabs-label">
                    {tab.name}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}