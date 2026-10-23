'use client';

import { useState } from 'react';
import MenuList from './MenuList';
import { useHeaderMenu } from '@/utils/hooks/useHeaderMenu';

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

const MainHeaderMenu = () => {
  const [isOpen, setIsOpen] = useState([]);
  const { menus } = useHeaderMenu();

  // Enforce the exact sequence, just like in PrimaryNavBar
  const primaryNavItems = PRIMARY_NAV_TITLES.map((title) =>
    menus.find((menu) => menu?.title === title)
  ).filter(Boolean);

  return (
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
  );
};

export default MainHeaderMenu;
