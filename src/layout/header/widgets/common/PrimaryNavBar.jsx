'use client';

import { useState } from 'react';
import MenuList from './MenuList';
import { useHeaderMenu } from '@/utils/hooks/useHeaderMenu';
import { usePathname } from 'next/navigation';

const PRIMARY_NAV_TITLES = [
  'Home',
  'Shop All',
  'Shop by Category',
  'Best Sellers',
  'Deals',
  'AI Negotiations',
  'For Business',
  'About Us',
  // 'Blogs',
  // 'Media',
  'Contact Us',
];

const PrimaryNavBar = () => {
  const [isOpen, setIsOpen] = useState([]);
  const { menus } = useHeaderMenu();
  const pathName = usePathname();

  // Map over PRIMARY_NAV_TITLES to enforce the exact sequence.
  // filter(Boolean) removes any undefined items if the API hasn't returned them yet.
  const primaryNavItems = PRIMARY_NAV_TITLES.map((title) =>
    menus.find((menu) => menu?.title === title)
  ).filter(Boolean);

  return (
    <div
      className={`primary-nav-bar primary-nav-bar--redesign ${pathName === '/checkout' ? 'd-none' : ''
        }`}
    >
      <div className="container-fluid-lg">
        <nav className="primary-nav main-nav navbar navbar-expand-xl navbar-light py-0 w-100">
          <ul className="navbar-nav">
            {primaryNavItems.map((menu, i) => (
              <MenuList
                menu={menu}
                key={menu.id || i}
                customClass={menu.customClass}
                anchorClass={
                  menu.children && menu.children.length > 0
                    ? 'nav-link dropdown-toggle'
                    : 'nav-link'
                }
                level={0}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default PrimaryNavBar;
