import React, { useContext, useState, useEffect } from 'react';
import Btn from '@/elements/buttons/Btn';
import MainHeaderMenu from './MainHeaderMenu';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { RiCloseLine } from 'react-icons/ri';
import Image from 'next/image';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import playstoreImage from '../../../../../public/assets/images/playstore.svg';
import appstoreImage from '../../../../../public/assets/images/appstore.svg';
import Dhootapapeshwar from '../../../../../public/assets/images/logo/ac-logo.png';
import CartContext from '@/helper/cartContext';


const ClassicHeaderMenu = () => {
  const [logo, setLogo] = useState(Dhootapapeshwar);
  const { mobileSideBar, setMobileSideBar, themeOption } = useContext(ThemeOptionContext);
  const { signupBonusCoins } = useContext(CartContext);

  useEffect(() => {
    setLogo(Dhootapapeshwar);
  }, [Dhootapapeshwar]);
  return (
    <div className="header-nav-middle d-xxl-none">
      <div className="main-nav navbar navbar-expand-xl navbar-light navbar-sticky">
        <div
          // className={`offcanvas offcanvas-collapse order-xl-2 ${mobileSideBar ? 'show' : ''}`}
          // id="primaryMenu"
          className={`offcanvas offcanvas-start offcanvas-xxl order-xl-2 primary-header-offcanvas ${mobileSideBar ? 'show' : ''}`}
          id="primaryMenu"
        >
          <div className="offcanvas-header navbar-shadow">
            {/* <h5>Menu</h5> */}
            <a href="/" className="web-logo nav-logo py-1">
              <Avatar
                data={logo}
                placeHolder={Dhootapapeshwar}
                name={'Header'}
                customImageClass={'img-fluid'}
                height={28}
                width={162}
                unoptimized
              />
            </a>
            <button
              className="btn-close lead"
              type="button"
              onClick={() => setMobileSideBar(!mobileSideBar)}
            >
              <RiCloseLine />
            </button>
          </div>
          <div className="offcanvas-body">
            <div
              className="d-flex flex-column overflow-auto overflow-xl-visible h-100 w-100 hide-scrollbar"
            >
              <div className="flex-grow-1">
                <MainHeaderMenu />
              </div>

              <div className="text-center app-promo-text-wrapper">
                <div className="text-center mb-1 fs-6 app-promo-text-title">Dhootapapeshwar App is LIVE!</div>
                <p className="text-center app-promo-text-description">Download & Signup, to get {signupBonusCoins} SDL Points.</p>
              </div>
              <div className="d-flex d-xxl-none justify-content-center gap-2 flex-nowrap">
                {themeOption?.footer?.play_store_url && (
                  <div className="position-relative sidebar-appstore-image">
                    <Link
                      href={themeOption?.footer?.play_store_url}
                      className="d-inline-block w-100"
                      target="_blank"
                    >
                      <Image
                        src={playstoreImage}
                        alt="play store"
                        className="position-relative"
                        height={'auto'}
                        width={100}
                      />
                    </Link>
                  </div>
                )}
                {themeOption?.footer?.app_store_url && (
                  <div className="position-relative sidebar-appstore-image">
                    <Link
                      href={themeOption?.footer?.app_store_url}
                      className="d-inline-block w-100"
                      target="_blank"
                    >
                      <Image
                        src={appstoreImage}
                        alt="app store"
                        className="position-relative"
                        height={'auto'}
                        width={100}
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {mobileSideBar && (
          <div
            className={'offcanvas-backdrop fade show'}
            onClick={() => setMobileSideBar(!mobileSideBar)}
          />
        )}
      </div>
    </div>
  );
};

export default ClassicHeaderMenu;
