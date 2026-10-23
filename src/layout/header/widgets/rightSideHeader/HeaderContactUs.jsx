import React, { useContext } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { RiPhoneLine } from 'react-icons/ri';

const HeaderContactUs = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <li className="right-side">
      <a className="delivery-login-box">
        <div className="delivery-icon">
          <RiPhoneLine />
        </div>
        <div className="delivery-detail">
          <h6>24/7 Delivery</h6>
          <h5>{themeOption?.header?.support_number}</h5>
        </div>
      </a>
    </li>
  );
};

export default HeaderContactUs;
