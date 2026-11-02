import React, { useContext, useMemo } from 'react';
import { Col } from 'reactstrap';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import FooterDownloadAppLink from './FooterDownloadAppLink';
import FooterSupportEmail from './FooterSupportEmail';
import FooterSupportNumber from './FooterSupportNumber';
import FooterNewsletter from './FooterNewsletter';
import PreferredSource from '@/app/(mainLayout)/badge/PreferredSource';
import { useTranslation } from '@/utils/translations';

const FooterContactUs = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <Col xl={3} lg={4} >
      {/* <div className={`footer-title contact-title`}>
        <h4><a href="/contact-us" className="" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a> </h4>
      </div> */}
      <div className="footer-contact" style={{ marginTop: 0 }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          <FooterNewsletter />
          {/* <FooterSupportNumber />
          <FooterSupportEmail /> */}
          {/* <FooterDownloadAppLink /> */}
          {/* <li className="social-app mb-0 mt-3" style={{ listStyle: 'none' }}>
            <PreferredSource />
          </li> */}
        </ul>
      </div>
    </Col>
  );
};

export default FooterContactUs;
