"use client";

import React, { useContext } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import ResponsiveSearch from '../common/ResponsiveSearch';
import HeaderWishList from './HeaderWishList';
import HeaderCart from './HeaderCart';
import HeaderContactUs from './HeaderContactUs';
import HeaderProfile from './HeaderProfile';
import { usePathname, useRouter } from 'next/navigation';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import StandardSearchBar from './StandardSearchBar';
import { useUser } from '@/utils/hooks/useUser';


const RightSideHeader = ({ noContactUs, wishListIcon }) => {
  const { isAuthenticated } = useUser();
  const router = useRouter();
  const pathName = usePathname();
  const { cartCanvas, setCartCanvas } = useContext(ThemeOptionContext);

  return (
    <div className="rightside-box">
      {pathName !== '/checkout' && <ResponsiveSearch />}
      <ul className="right-side-menu">
        <li className={`right-side right-side--search ${pathName === '/checkout' ? '' : ''}`}>
          <div className="delivery-login-box">
            <StandardSearchBar />
          </div>
        </li>
        {!noContactUs && <HeaderContactUs />}
        {/* {isAuthenticated && <HeaderWishList wishListIcon={wishListIcon} />} */}
        {/* {pathName !== '/checkout' && <HeaderWishList wishListIcon={wishListIcon} />} */}
        {<HeaderWishList wishListIcon={wishListIcon} />}
        <HeaderCart />
        <HeaderProfile />
      </ul>
      <div
        className={`bg-overlay  ${cartCanvas ? 'show' : ''}`}
        onClick={() => setCartCanvas((prev) => !prev)}
      />
    </div>
  );
};

export default RightSideHeader;
