import React, { useContext } from 'react';
import { FiPhone } from 'react-icons/fi';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useTranslation } from '@/utils/translations';

const FooterSupportNumber = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { t } = useTranslation('common');
  return (
    <>
      {themeOption?.footer?.support_number && (
        <li>
          <div className="footer-number">
            <FiPhone />
            <div className="contact-number">
              <h6 className="text-content">{t('Hotline')} 24/7 :</h6>
              <h5>{themeOption?.footer?.support_number}</h5>
            </div>
          </div>
        </li>
      )}
    </>
  );
};

export default FooterSupportNumber;
