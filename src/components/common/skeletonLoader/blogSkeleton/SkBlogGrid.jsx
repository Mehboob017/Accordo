/**
 * Blog card skeleton – list_view (horizontal, full-width) & grid_view (vertical card)
 * Matches the real BlogCardContain layout exactly.
 */

/* ── Shimmer keyframe (inlined so the skeleton works without any external CSS) ── */
const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
  backgroundSize: '400% 100%',
  animation: 'sk-shimmer 1.4s ease infinite',
  borderRadius: '4px',
};

/** Helper – a plain shimmer block */
const Sk = ({ style = {} }) => (
  <div style={{ ...shimmerStyle, ...style }} />
);

/* ─────────────────────────────────────────────────────────────
   LIST-VIEW skeleton  (horizontal card – image left, text right)
   Matches: thumbnail ~220×140 | category tag | title 2 lines |
            excerpt 3 lines | author avatar + name | date
────────────────────────────────────────────────────────────── */
const SkListCard = () => (
  <div
    style={{
      display: 'flex',
      gap: '20px',
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}
  >
    {/* Thumbnail */}
    <div style={{ flexShrink: 0 }}>
      <Sk style={{ width: '220px', height: '148px', borderRadius: '6px' }} />
    </div>

    {/* Text content */}
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Category tag pill */}
      <Sk style={{ width: '90px', height: '20px', borderRadius: '20px' }} />

      {/* Title – 2 lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Sk style={{ width: '85%', height: '18px' }} />
        <Sk style={{ width: '65%', height: '18px' }} />
      </div>

      {/* Excerpt – 3 lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Sk style={{ width: '100%', height: '13px' }} />
        <Sk style={{ width: '100%', height: '13px' }} />
        <Sk style={{ width: '70%', height: '13px' }} />
      </div>

      {/* Footer: author avatar + name + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', paddingTop: '6px' }}>
        <Sk style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
        <Sk style={{ width: '100px', height: '13px' }} />
        <Sk style={{ width: '70px', height: '13px', marginLeft: 'auto' }} />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   GRID-VIEW skeleton  (vertical card – image on top, text below)
────────────────────────────────────────────────────────────── */
const SkGridCard = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}
  >
    <Sk style={{ width: '100%', paddingTop: '60%', height: 0, borderRadius: 0 }} />
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Sk style={{ width: '80px', height: '18px', borderRadius: '20px' }} />
      <Sk style={{ width: '90%', height: '16px' }} />
      <Sk style={{ width: '70%', height: '16px' }} />
      <Sk style={{ width: '100%', height: '12px' }} />
      <Sk style={{ width: '80%', height: '12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
        <Sk style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
        <Sk style={{ width: '90px', height: '12px' }} />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Public component
────────────────────────────────────────────────────────────── */
const SkBlogGrid = ({ variant = 'grid_view' }) => {
  if (variant === 'list_view') return <SkListCard />;
  return <SkGridCard />;
};

export default SkBlogGrid;
