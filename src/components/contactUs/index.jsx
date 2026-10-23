import WrapperComponent from '../common/WrapperComponent';
import MapSection from './MapSection';
import ContactLeftSideBox from './ContactLeftSideBox';
import ContactRightSidebar from './contactRightSidebar';
import ContactImageBox from './ContactImageBox';
import Breadcrumb from '../common/Breadcrumb';
import { Row } from 'reactstrap';
import CustomHeading from '../common/CustomHeading';

const ContactUsContent = () => {
  return (
    <>
      {/* <Breadcrumb title={'ContactUs'} subNavigation={[{ name: 'ContactUs' }]} /> */}
      <WrapperComponent
        classes={{ sectionClass: 'contact-box-section' }}
        customCol={true}
        noRowCol={true}
      >
        <div className="events-header">
          <h1 className="events-title">Contact Us</h1>
          <h2 className="sr-only">This is a contact us page.</h2>
          <p className="events-subtitle">
            Reach out to Shree Dhootapapeshwar Limited for product enquiries, customer support, and office locations across India.
          </p>
        </div>
        <Row className="g-4 align-items-stretch">
          {/* <CustomHeading
            title={'Contact Us'}
            customtitleClass={'d-xxl-none d-block'}
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

export default ContactUsContent;
