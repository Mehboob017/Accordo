'use client';
import React, { useContext, useEffect, useState } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import Avatar from '@/components/common/Avatar';
import Dhootapapeshwar from '../../../../../public/assets/images/logo/ac-logo.png';
import { RiMenuLine } from 'react-icons/ri';
import { usePathname } from 'next/navigation';
import HeaderLocation from './HeaderLocation';

const HeaderLogo = ({ showLocation = true }) => {
  const [logo, setLogo] = useState(Dhootapapeshwar);
  const { mobileSideBar, setMobileSideBar } = useContext(ThemeOptionContext);
  const pathName = usePathname();

  useEffect(() => {
    let logo = Dhootapapeshwar;
    setLogo(logo);
  }, [pathName, Dhootapapeshwar]);

  return (
    <div className="navbar-top-left">
      <button
        className={`navbar-toggler d-xl-none d-inline navbar-menu-button me-2 header-menu-trigger ${pathName === '/checkout' ? 'd-none' : ''}`}
        type="button"
        aria-label="Toggle menu"
      >
        <span
          className="navbar-toggler-icon"
          onClick={() => setMobileSideBar(!mobileSideBar)}
        >
          <RiMenuLine />
        </span>
      </button>
      <a href="/" className="web-logo nav-logo">
        <Avatar
          data={logo}
          placeHolder={Dhootapapeshwar}
          name={'Header'}
          customImageClass={'img-fluid'}
          height={32}
          width={160}
          unoptimized
        />
      </a>

      {showLocation && pathName !== '/checkout' && (
        <div className="header-location-box d-none d-lg-flex align-items-center">
          <span className="header-logo-divider" aria-hidden="true" />
          <HeaderLocation />
        </div>
      )}
    </div>
  );
};

export default HeaderLogo;
