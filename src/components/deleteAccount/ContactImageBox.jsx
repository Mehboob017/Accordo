import Image from 'next/image';
import { Col } from 'reactstrap';
import { useContext } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import contactUsImage from '../../../public/assets/images/inner-page/contact-us.png';

const ContactImageBox = () => {
  const { themeOption } = useContext(ThemeOptionContext);

  return (
    <Col lg={6} className="h-100">
      <div className="left-sidebar-box h-100">
        <div className="contact-image h-100">
          <Image
            src={themeOption?.contact_us?.imageUrl || contactUsImage}
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
