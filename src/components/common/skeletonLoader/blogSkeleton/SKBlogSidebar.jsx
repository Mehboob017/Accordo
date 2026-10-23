import {
  UncontrolledAccordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from 'reactstrap';

/* ── Shared shimmer style ── */
const shimmer = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
  backgroundSize: '400% 100%',
  animation: 'sk-shimmer 1.4s ease infinite',
  borderRadius: '4px',
  display: 'block',
};

const Sk = ({ style = {} }) => <span style={{ ...shimmer, ...style }} />;

/**
 * Sidebar skeleton – mirrors the real accordion sections:
 *   1. Recent Post  (image + category chip + title + author + arrow)
 *   2. Category     (label + count for 5 rows)
 */
const SKBlogSidebar = () => (
  <>
    {/* ── keyframe injected once ── */}
    <style>{`
      @keyframes sk-shimmer {
        0%   { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
      }
    `}</style>

    <UncontrolledAccordion
      className="left-accordion-box"
      defaultOpen={['1', '2']}
    >
      {/* ══════════════════ Recent Post ══════════════════ */}
      <AccordionItem>
        <AccordionHeader targetId="1">
          {/* "Recent Post" heading skeleton */}
          <Sk style={{ width: '110px', height: '18px' }} />
        </AccordionHeader>

        <AccordionBody accordionId="1" className="pt-0">
          <div className="recent-post-box">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="recent-box recent-post-card"
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < 2 ? '1px solid #f3f3f3' : 'none',
                }}
              >
                {/* Thumbnail */}
                <Sk
                  style={{
                    flexShrink: 0,
                    width: '90px',
                    height: '75px',
                    borderRadius: '6px',
                  }}
                />

                {/* Right-side content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Category chip */}
                  <Sk style={{ width: '80px', height: '16px', borderRadius: '20px' }} />

                  {/* Title – 2 lines */}
                  <Sk style={{ width: '100%', height: '14px' }} />
                  <Sk style={{ width: '75%', height: '14px' }} />

                  {/* Author row + arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                    <Sk style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                    <Sk style={{ width: '80px', height: '12px' }} />
                    <Sk style={{ width: '24px', height: '24px', borderRadius: '50%', marginLeft: 'auto' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionBody>
      </AccordionItem>

      {/* ══════════════════ Category ══════════════════ */}
      <AccordionItem>
        <AccordionHeader targetId="2">
          <Sk style={{ width: '80px', height: '18px' }} />
        </AccordionHeader>

        <AccordionBody accordionId="2" className="p-0">
          <div className="category-list-box">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[100, 85, 70, 90, 60].map((w, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < 4 ? '1px solid #f3f3f3' : 'none',
                  }}
                >
                  <Sk style={{ width: `${w}px`, height: '14px' }} />
                  <Sk style={{ width: '28px', height: '14px', borderRadius: '20px' }} />
                </li>
              ))}
            </ul>
          </div>
        </AccordionBody>
      </AccordionItem>
    </UncontrolledAccordion>
  </>
);

export default SKBlogSidebar;
