import Image from 'next/image';
import { Col } from 'reactstrap';
import contactUsImage from '../../../public/assets/images/contact/contact.jpeg';

const ContactImageBox = () => {

  return (
    <Col lg={6} className="h-100">
      <div className="left-sidebar-box h-100">
        <div className="contact-image h-100">
          <Image
            // src={themeOption?.contact_us?.imageUrl || contactUsImage}
            src={contactUsImage}
            className="img-fluid"
            alt="contact"
            height={461}
            width={386}
            unoptimized
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </Col>
  );
};

export default ContactImageBox;
