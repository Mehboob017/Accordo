import React, { useContext } from 'react';
import { FiMail } from 'react-icons/fi';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useTranslation } from '@/utils/translations';

const FooterSupportEmail = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { t } = useTranslation('common');
  return (
    <>
      {themeOption?.footer?.support_email && (
        <li>
          <div className="footer-number">
            <FiMail />
            <div className="contact-number">
              <h6 className="text-content">{t('EmailAddress')} :</h6>
              <h5>{themeOption?.footer?.support_email}</h5>
            </div>
          </div>
        </li>
      )}
    </>
  );
};

export default FooterSupportEmail;
