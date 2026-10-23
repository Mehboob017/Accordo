import React, { useContext, useMemo } from 'react';
import { Col } from 'reactstrap';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import FooterDownloadAppLink from './FooterDownloadAppLink';
import FooterSupportEmail from './FooterSupportEmail';
import FooterSupportNumber from './FooterSupportNumber';
import FooterNewsletter from './FooterNewsletter';
import { useTranslation } from '@/utils/translations';

const FooterContactUs = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <Col xl={3} lg={4} sm={6}>
      <div className={`footer-title contact-title`}>
        <h4><a href="/contact-us" className="" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a> </h4>
      </div>
      <div className="footer-contact">
        <ul>
          <FooterNewsletter />
          {/* <FooterSupportNumber />
          <FooterSupportEmail /> */}
          <FooterDownloadAppLink />
        </ul>
      </div>
    </Col>
  );
};

export default FooterContactUs;
