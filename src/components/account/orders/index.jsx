'use client';
// import Breadcrumb from '@/components/common/Breadcrumb';
import WrapperComponent from '@/components/common/WrapperComponent';
import AccountSidebar from '../common/AccountSidebar';
import { Col, TabContent, TabPane } from 'reactstrap';
import ResponsiveMenuOpen from '../common/ResponsiveMenuOpen';
import MyOrders from './MyOrders';

const AccountOrders = () => {
  return (
    <>
      {/* <Breadcrumb title={'Orders'} subNavigation={[{ name: 'Orders' }]} /> */}
      <WrapperComponent
        classes={{ sectionClass: 'user-dashboard-section section-b-space' }}
        customCol={true}
      >
        <AccountSidebar tabActive={'orders'} />
        <Col lg={8}>
          {/* <ResponsiveMenuOpen /> */}
          <div className="dashboard-right-sidebar p-0">
            <TabContent>
              <TabPane className="show active">
                <MyOrders />
              </TabPane>
            </TabContent>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default AccountOrders;
