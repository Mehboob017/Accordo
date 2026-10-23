'use client';

import { useState } from 'react';
import MenuList from './MenuList';
import { useHeaderMenu } from '@/utils/hooks/useHeaderMenu';
import { usePathname } from 'next/navigation';

// const PRIMARY_NAV_TITLES = [
//   'Home',
//   'About Us',
//   'Shop by Category',
//   'Shop by Herbs',
//   'Shop by Health Concerns',
//   'Blogs',
//   'Shop by Best Seller',
//   'Shop by Combo',
// ];

const PRIMARY_NAV_TITLES = [
  'Home',
  'Shop Online',
  'Best Sellers',
  'Combo Pack',
  'Shop by Category',
  'Shop by Health Concerns',
  'About Us',
  'Blogs',
  'Media',
  'Careers',
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
                // customClass={`${menu.customClass || 'nav-item'}${menu.id === 'careers' || menu.title === 'Careers' ? ' nav-item-careers' : ''}`.trim()}
                customClass={menu.customClass}
                anchorClass={
                  menu.children && menu.children.length > 0 // <-- Checks if it actually has dropdown items
                    ? 'nav-link dropdown-toggle'
                    : 'nav-link' // <-- Blogs gets this plain link class
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
