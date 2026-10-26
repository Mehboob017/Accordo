'use client';
import React, { useContext, useEffect, useState } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import Avatar from '@/components/common/Avatar';
import Dhootapapeshwar from '../../../../../public/assets/images/logo/ac-logo-white.png';
import { RiMenuLine } from 'react-icons/ri';
import { usePathname } from 'next/navigation';

const HeaderLogo = () => {
  const [logo, setLogo] = useState(Dhootapapeshwar);
  const { mobileSideBar, setMobileSideBar } = useContext(ThemeOptionContext);
  const pathName = usePathname();
  useEffect(() => {
    let logo = Dhootapapeshwar;
    // console.log(logo);
    setLogo(logo);
  }, [pathName, Dhootapapeshwar]);
  return (
    <>
      <button
        className={`navbar-toggler d-xxl-none d-inline navbar-menu-button me-2 header-menu-trigger ${pathName === '/checkout' ? 'd-none' : ''}`}
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
      <a href="/" className="web-logo nav-logo ">
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
    </>
  );
};

export default HeaderLogo;
