import { useContext } from 'react';
import { Col, Row } from 'reactstrap';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useHeaderScroll } from '@/utils/HeaderScroll';
// import HeaderCategory from './common/HeaderCategory';
import HeaderLogo from './common/HeaderLogo';
import HeaderTopBar from './common/HeaderTopBar';
import RightSideHeader from './rightSideHeader';
import ClassicHeaderMenu from './common/ClassicHeaderMenu';
import PrimaryNavBar from './common/PrimaryNavBar';

const BasicHeader = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const UpScroll = useHeaderScroll(false);

  return (
    <header
      translate="no"
      className={`pb-md-0 pb-0 basic-header-redesign ${themeOption?.header?.sticky_header_enable && UpScroll ? 'active' : ''
        }`}
    >
      {/* {themeOption?.header?.page_top_bar_enable && ( */}
      <HeaderTopBar isHidden={UpScroll} />
      {/* )} */}

      <div className="top-nav top-header sticky-header">
        <div className="container-fluid-lg basic-header-redesign__top-wrap">
          <Row>
            <Col xs="12">
              <div className="navbar-top">
                <HeaderLogo />
                <ClassicHeaderMenu />
                <RightSideHeader noContactUs />
              </div>
            </Col>
          </Row>
        </div>
        <PrimaryNavBar />
      </div>
    </header>
  );
};

export default BasicHeader;