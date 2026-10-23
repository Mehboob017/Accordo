'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { footerMenuItems } from '../../data/Footer';
import MobileCategoryBrowser from '@/components/common/MobileCategoryBrowser';
import MobileProfileOffcanvas from '@/components/account/profile/MobileProfileOffcanvas';

const MD_BREAKPOINT = 768;

const MobileMenu = () => {
  const pathName = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Sync active tab with current route
  useEffect(() => {
    if (pathName) {
      const currentMenu = footerMenuItems.find(
        (menu) => menu.path === pathName
      );
      setActiveTab(currentMenu ? currentMenu.title : '');
    }
  }, [pathName]);

  // Handle responsive category browser closing
  useEffect(() => {
    if (!categoryOpen) return;

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
        setCategoryOpen(false);
        router.push('/collections');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categoryOpen, router]);

  const handleItemClick = useCallback((e, data) => {
    if (data.className?.includes('mobile-category')) {
      e.preventDefault();
      setActiveTab(data.title);
      setCategoryOpen(true);
      return;
    }

    if (data.className?.includes('footer-profile')) {
      e.preventDefault();
      setActiveTab(data.title);
      setProfileOpen(true); // Open the new offcanvas
      return;
    }

    setActiveTab(data.title);
  }, []);

  // Hide entirely on checkout page
  if (pathName === '/checkout') return null;

  return (
    <>
      <nav translate="no" className="modern-mobile-menu mobile-menu d-block d-lg-none">
        <ul className="menu-list">
          {footerMenuItems.map((data, index) => {
            const isActive = activeTab === data.title;

            // Render content inside the anchor/link
            const MenuContent = () => (
              <>
                <div className="icon-wrapper">
                  {isActive ? data.fillIcon : data.lineIcon}
                </div>
                <span className="tab-title">{data.title}</span>
              </>
            );

            return (
              <li
                key={index}
                className={`menu-item ${isActive ? 'active' : ''} ${data.className || ''
                  }`}
              >
                {data.className?.includes('mobile-category') ? (
                  <a
                    href={data.path}
                    onClick={(e) => handleItemClick(e, data)}
                    className="menu-link"
                    aria-label={`Open ${data.title}`}
                  >
                    <MenuContent />
                  </a>
                ) : (
                  <Link
                    href={data.path}
                    onClick={(e) => handleItemClick(e, data)}
                    className="menu-link"
                    aria-label={`Go to ${data.title}`}
                  >
                    <MenuContent />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileCategoryBrowser
        isOpen={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      />

      <MobileProfileOffcanvas
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};

export default MobileMenu;
