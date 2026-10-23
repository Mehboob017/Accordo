'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/utils/hooks/useUser';
import { useLogout } from '@/utils/hooks/useAuth';
import Avatar from '@/components/common/Avatar';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';

import {
  RiCloseLine,
  RiFileList3Line,
  RiHeart3Line,
  RiMapPinLine,
  RiLogoutBoxLine,
  RiArrowRightSLine,
  RiUser3Line,
  RiUserLine,
  RiBookmarkLine,
  RiCoinLine,
  RiFileTextLine,
  RiUserStarLine,
} from 'react-icons/ri';

import styles from './MobileProfileOffcanvas.module.scss';

const menuItems = [
  {
    id: 'profile',
    title: 'My Profile',
    icon: <RiUserLine />,
    path: '/account/my-profile',
  },
  {
    id: 'orders',
    title: 'My Orders',
    icon: <RiFileTextLine />,
    path: '/account/orders',
  },
  {
    id: 'points',
    title: 'SDL Points',
    icon: <RiCoinLine />,
    path: '/account/coins',
  },
  {
    id: 'addresses',
    title: 'Saved Addresses',
    icon: <RiMapPinLine />,
    path: '/account/addresses',
  },
  // {
  //   id: 'track-orders',
  //   title: 'Track Orders',
  //   icon: <RiFileList3Line />,
  //   path: '/track-orders',
  // },
  {
    id: 'wishlist',
    title: 'Wishlist',
    icon: <RiHeart3Line />,
    path: '/wishlist',
  },
  {
    id: 'bookmarks',
    title: 'My Bookmarks',
    icon: <RiBookmarkLine />,
    path: '/bookmarks',
  },
];

const MobileProfileOffcanvas = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { userData, isUserLoading, isAuthenticated } = useUser();
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();

  const [logoutModal, setLogoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fullName =
    `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim();

  const initials = `${userData?.firstName?.[0] ?? 'U'}${userData?.lastName?.[0] ?? ''
    }`.toUpperCase();

  const handleLogout = () => {
    logoutMutate(
      { phone: userData?.phone },
      {
        onSuccess: () => {
          setLogoutModal(false);
          onClose();
          router.push('/');
        },
      }
    );
  };

  const renderContent = () => {
    if (isUserLoading) {
      return <div className={styles.loadingState}>Loading...</div>;
    }

    if (!isAuthenticated) {
      return (
        <div className={styles.guestState}>
          <button
            className={styles.loginBtn}
            onClick={() => setShowLoginModal(true)}
          >
            <RiUser3Line className={styles.loginSignupIcon} />
            <span className={styles.loginSignupText}>Login / Signup</span>
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.userSummaryCard}>
          <div className={styles.avatarWrapper}>
            {userData?.profileImage ? (
              <Avatar
                name={fullName}
                customImageClass={styles.roundedAvatar}
                alt="profile"
                height={64}
                width={64}
                data={userData.profileImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>{initials}</div>
            )}
          </div>

          <div className={styles.userDetails}>
            <div>{fullName}</div>
            <p>+91 {userData?.phone}</p>
          </div>
        </div>

        <nav className={styles.accountNavigation}>
          <ul className={styles.navList}>
            {menuItems.map(({ id, title, icon, path }) => (
              <li key={id} className={styles.navItem}>
                <Link
                  prefetch={false}
                  href={path}
                  onClick={onClose}
                  className={`${styles.navLink} ${pathname === path ? styles.active : ''
                    }`}
                >
                  <div className={styles.navLinkLeft}>
                    <span className={styles.navIcon}>{icon}</span>
                    <span className={styles.navTitle}>{title}</span>
                  </div>

                  <RiArrowRightSLine className={styles.navChevron} />
                </Link>
              </li>
            ))}

            {!userData?.isDoctor && (
              <li className={styles.navItem}>
                <button
                  type="button"
                  className={styles.navLink}
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <div className={styles.navLinkLeft}>
                    <span className={styles.navIcon}>
                      <RiUserStarLine />
                    </span>

                    <span className={styles.navTitle}>Upgrade to Vaidya</span>
                  </div>

                  <RiArrowRightSLine className={styles.navChevron} />
                </button>
              </li>
            )}
          </ul>
        </nav>
      </>
    );
  };

  return (
    <>
      <div
        className={`${styles.profileOffcanvasOverlay} ${isOpen ? styles.show : ''
          }`}
        onClick={onClose}
      />

      <div
        className={`${styles.profileOffcanvasPanel} ${isOpen ? styles.open : ''
          }`}
      >
        <div className={styles.offcanvasHeader}>
          <div className={styles.title}>My Account</div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <RiCloseLine />
          </button>
        </div>

        <div className={styles.offcanvasBody}>{renderContent()}</div>

        {isAuthenticated && (
          <div className={styles.offcanvasFooter}>
            <button
              className={`${styles.logoutBtn} btn btn-primary`}
              onClick={() => setLogoutModal(true)}
            >
              <RiLogoutBoxLine className={styles.btnIcon} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        modal={logoutModal}
        setModal={setLogoutModal}
        confirmFunction={handleLogout}
        isLoading={isLoggingOut}
      />

      <OtpLoginModal
        isOpen={showLoginModal}
        setOpen={setShowLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <OtpLoginModal
        isOpen={showUpgradeModal}
        setOpen={setShowUpgradeModal}
        isUpgradeMode
      />
    </>
  );
};

export default MobileProfileOffcanvas;
