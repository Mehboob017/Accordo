'use client';

// import Breadcrumb from '@/components/common/Breadcrumb';
import WrapperComponent from '@/components/common/WrapperComponent';
import AccountSidebar from '../common/AccountSidebar';
import { Col, TabContent, TabPane } from 'reactstrap';
import ResponsiveMenuOpen from '../common/ResponsiveMenuOpen';
import PointTopBar from './PointTopBar';

const AccountPoints = () => {
  return (
    <>
      {/* <Breadcrumb title={'SDL Points'} subNavigation={[{ name: 'SDL Points' }]} /> */}
      <WrapperComponent
        classes={{ sectionClass: 'user-dashboard-section section-b-space' }}
        customCol={true}
      >
        <AccountSidebar tabActive={'points'} />

        <Col lg={8}>
          {/* <ResponsiveMenuOpen /> */}
          <div className="dashboard-right-sidebar p-0">
            <TabContent>
              <TabPane className="show active">
                <PointTopBar />
              </TabPane>
            </TabContent>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default AccountPoints;
