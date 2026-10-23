import React, { useContext } from 'react';
import Image from 'next/image';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import FooterSocial from './FooterSocial';
import paymentImage from '../../../../public/assets/images/payment/2.png';
import amazonLogo from '../../../../public/assets/images/ecommerceSite/Amazon_logo1.webp';
import flipkartLogo from '../../../../public/assets/images/ecommerceSite/flipkart1.svg';
import aPharmacyLogo from '../../../../public/assets/images/ecommerceSite/a-pharmacy1.png';
import oneMgLogo from '../../../../public/assets/images/ecommerceSite/1mg.png';
import netmedsLogo from '../../../../public/assets/images/ecommerceSite/netmeds.png';
import zeptoLogo from '../../../../public/assets/images/ecommerceSite/Zepto_Logo.png';

const SubFooter = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <div translate="no" className="sub-footer  no-mobile-gap" >
      {/* {themeOption?.footer?.footer_copyright && (
        <div className="reserve">
          <h6 className="text-content">
            &copy; {new Date().getFullYear()} Dhootapapeshwar. All rights reserved.
          </h6>
        </div>
      )} */}

      <FooterSocial />

      <div className="ecommerce-sites">
        <div className="text-content fw-semibold">Available on : </div>
        <div className="ecommerce-sites-content">
          <Image src={flipkartLogo} alt="Flipkart" height={18} width={54} />
          <Image src={amazonLogo} alt="Amazon" height={18} width={54} />
          <Image src={netmedsLogo} alt="Netmeds" height={18} width={54} />
          <Image src={oneMgLogo} alt="1mg" height={18} width={54} />
          <Image src={aPharmacyLogo} alt="A Pharmacy" height={18} width={54} />
          {/* <Image src={zeptoLogo} alt="Zepto" height={18} width={54} /> */}
        </div>
      </div>

      <div className="payment">
        <div className="text-content fw-semibold">Supported :</div>
        <Image src={paymentImage} alt="payment" height={35} width={302} />
      </div>
      {/* <FooterSocial /> */}


    </div>
  );
};

export default SubFooter;
