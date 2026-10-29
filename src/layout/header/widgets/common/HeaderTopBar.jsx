'use client';

import React, { useContext, useEffect, useRef } from 'react';
import { Col, Row } from 'reactstrap';
import TopbarMarquee from './TopbarMarquee';
// import TopbarSlider from './TopbarSlider';
import HeaderGetApp from './HeaderGetApp';
import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import TopbarLeft from './TopbarLeft';
// import ThemeOptionContext from '@/helper/themeOptionsContext';
// import { usePathname } from 'next/navigation';
// import { RiPhoneLine } from 'react-icons/ri';
const HeaderTopBar = ({ isHidden }) => {
  // const { themeOption } = useContext(ThemeOptionContext);
  const addClass = useRef(null);
  const pathName = usePathname();

  // const pathName = usePathname();
  // useEffect(() => {
  //   if (pathName == `/theme/tokyo`) {
  //     addClass.current?.classList.add('bg-dark');
  //   }

  //   return () => {
  //     addClass.current?.classList.remove('bg-dark');
  //   };
  // }, [pathName]);
  return (
    <div
      // className={`header-top ${themeOption?.header?.page_top_bar_dark ? ' bg-dark' : ''} header-top-bar ${isHidden ? 'is-hidden' : ''}`}
      className={`header-top header-top-bar ${pathName === '/checkout' ? 'd-none' : ''} ${isHidden ? 'is-hidden' : ''}`}
      ref={addClass}
    >
      <div className=" header-top-bar__inner">
        <Row className="align-items-center">
          <Col xs={12}>
            {/* <TopbarSlider /> */}
            <TopbarMarquee />
          </Col>
          {/* <Col xs={5} sm={3} xxl={3}>
            <ul className="about-list right-nav-about">
              <li className="right-nav-list d-none d-sm-inline-block">
                <a href="/find-the-store" className="text-reset text-nowrap">
                  Find Store
                </a>
              </li>
              <li className="right-nav-list">
                <HeaderGetApp />
              </li>
            </ul>
          </Col> */}
        </Row>
      </div>
    </div>
  );
};
export default HeaderTopBar;
