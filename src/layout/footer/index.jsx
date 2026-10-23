import { useState } from 'react';
import { Row } from 'reactstrap';
import FooterCategory from './widgets/FooterCategory';
import FooterUseFul from './widgets/FooterUseFul';
import FooterQuickPage from './widgets/FooterQuickPage';
import SubFooter from './widgets/SubFooter';
import SubFooter2 from './widgets/SubFooter2';
import FooterContactUs from './widgets/FooterContactUs';
import FooterLogoContent from './widgets/FooterLogoContent';
import FooterHighlights from './widgets/FooterHighlights';
import KeywordsSection from '@/components/common/KeywordsSection';
import { useKeywords } from '@/utils/hooks/useHome';

const MainFooter = () => {
  const [footerMenu, setFooterMenu] = useState('');
  const { data } = useKeywords();
  const keywords = data?.data?.metaKeywords || [];

  return (
    <>
      <footer
        translate="no"
        //  footer-section-2 footer-color-2
        className={`section-t-space`}
      >
        <div className="container-fluid-lg">
          <div className="main-footer ">
            <Row className="g-md-4 g-3">
              <FooterLogoContent />
              <FooterCategory
                footerMenu={footerMenu}
                setFooterMenu={setFooterMenu}
              />
              <FooterUseFul
                footerMenu={footerMenu}
                setFooterMenu={setFooterMenu}
              />
              <FooterQuickPage
                footerMenu={footerMenu}
                setFooterMenu={setFooterMenu}
              />
              <FooterContactUs
                footerMenu={footerMenu}
                setFooterMenu={setFooterMenu}
              />
            </Row>
          </div>
          <FooterHighlights />
          <SubFooter2 />
          <SubFooter />
        </div>
        <div className="home-bottom-footer-space" style={{
          backgroundColor: '#f5f5f4',
        }}>
          <KeywordsSection keywords={keywords} />
        </div>
      </footer>
    </>
  );
};

export default MainFooter;
