import React, { useContext } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import FooterSocial from './FooterSocial';

const SubFooter2 = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <div translate="no" className="sub-footer no-mobile-gap">
      <FooterSocial />

      <h6 className="text-content-color my-md-1 term-policy">
        <a href="/disclaimer" target="_blank" rel="noreferrer">
          Disclaimer
        </a>{' '}
        |{' '}
        <a href="/privacy-policy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>{' '}
        |{' '}
        <a href="/return-policy" target="_blank" rel="noreferrer">
          Return & Refund Policy
        </a>{' '}
        |{' '}
        <a href="/grievance-policy" target="_blank" rel="noreferrer">
          Grievance Policy
        </a>{' '}
        |{' '}
        <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
          Terms & Conditions
        </a>
      </h6>
    </div>
  );
};

export default SubFooter2;
