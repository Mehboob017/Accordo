'use client';

import WrapperComponent from '../common/WrapperComponent';
import MapSection from './MapSection';
import ContactLeftSideBox from './ContactLeftSideBox';
import ContactRightSidebar from './contactRightSidebar';
import ContactImageBox from './ContactImageBox';
import Breadcrumb from '../common/Breadcrumb';
import { Row } from 'reactstrap';
import CustomHeading from '../common/CustomHeading';

const DeleteAccountContent = () => {
  return (
    <>
      {/* <Breadcrumb title={'ContactUs'} subNavigation={[{ name: 'ContactUs' }]} /> */}
      <WrapperComponent
        classes={{ sectionClass: 'contact-box-section' }}
        customCol={true}
        noRowCol={true}
      >
        <div className="events-header">
          <h1 className="events-title">Delete Account</h1>
          <h2 className="sr-only">This is a delete account page.</h2>
          <p className="events-subtitle">
            Fill out the form below to request the deletion of your account and personal data. Our team will initiate the process within 24 hours.
          </p>
        </div>
        <Row className="g-4 align-items-stretch">
          {/* <CustomHeading
            title={'Delete Account'}
            customtitleClass={'d-xxl-none d-block'}
            subTitle="Fill out the form below to request the deletion of your account and personal data. Our team will initiate the process within 24 hours."
          /> */}
          <ContactImageBox />
          <ContactRightSidebar />
        </Row>
        <Row className="mt-4">
          <ContactLeftSideBox />
        </Row>
      </WrapperComponent>
      <MapSection />
    </>
  );
};

export default DeleteAccountContent;
