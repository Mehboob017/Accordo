/**
 * Search + Sort bar skeleton - matches the events-search-sort-row layout:
 *   [  Search input (2/3 width)  ]  [  Sort dropdown (1/3 width)  ]
 */

const shimmer = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
  backgroundSize: '400% 100%',
  animation: 'sk-shimmer 1.4s ease infinite',
  borderRadius: '6px',
  display: 'block',
};

const Sk = ({ style = {} }) => <span style={{ ...shimmer, ...style }} />;

const SkSearchBar = () => (
  <div className="events-search-sort-row" style={{ margin: '16px 0' }}>
    <style>{`
      @keyframes sk-shimmer {
        0%   { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
      }
    `}</style>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Search input */}
      <Sk style={{ flex: '2 1 200px', height: '44px', borderRadius: '8px' }} />
      {/* Sort dropdown */}
      <Sk style={{ flex: '1 1 100px', height: '44px', borderRadius: '8px' }} />
    </div>
  </div>
);

export default SkSearchBar;
