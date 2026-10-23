import React, { useState } from 'react';
import {
  RiUser3Line,
  RiUserLine,
  RiArrowDownSLine,
  // RiLogoutBoxRLine, // Commented out: Used only in dropdown
  // RiHeart3Line,     // Commented out: Used only in dropdown
  // RiBookmarkLine,   // Commented out: Used only in dropdown
} from 'react-icons/ri';
// import ConfirmationModal from '@/components/common/ConfirmationModal'; // Commented out: Used only in dropdown
import Avatar from '@/components/common/Avatar';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
// import { useLogout } from '@/utils/hooks/useAuth'; // Commented out: Related to dropdown logout
import { useUser } from '@/utils/hooks/useUser';
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/navigation';       // Commented out: Used after logout

const HeaderProfile = () => {
  const { userData } = useUser();
  const [otpModal, setOtpModal] = useState(false);
  const router = useRouter();

  // --- COMMENTED OUT: State and logic for dropdown/logout ---
  // const [modal, setModal] = useState(false);
  // const router = useRouter();
  // const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();

  // const handleLogout = () => {
  //   logoutMutate(
  //     { phone: userData?.phone },
  //     {
  //       onSuccess: () => {
  //         setModal(false);
  //         router.refresh();
  //       },
  //     }
  //   );
  // };

  const isLoggedIn = Boolean(userData?.uid);

  {
    /* Kept: The main button showing either Login/Signup or User Profile Chip */
  }
  return (
    <li className="right-side d-none d-lg-block">
      <div
        className={`delivery-login-box ${!isLoggedIn ? 'login-signup-pill' : 'header-user-chip'}`}
        onClick={() => {
          if (!isLoggedIn) setOtpModal(true);
        }}
        role={!isLoggedIn ? 'button' : undefined}
        tabIndex={!isLoggedIn ? 0 : undefined}
      >
        <div
          className="delivery-icon d-flex align-items-center lh-1"
          style={{ gap: '8px' }}
        >
          {isLoggedIn ? (
            <span
              onClick={() => (window.location.href = '/account/my-profile')}
            >
              <span className="header-user-chip__avatar me-1">
                {userData?.profile_image?.original_url ? (
                  <Avatar
                    data={userData?.profile_image}
                    customClass="user-box"
                    customImageClass="img-fluid header-avatar"
                    height={26}
                    width={26}
                  />
                ) : (
                  <RiUserLine className="header-user-chip__user-icon" />
                )}
              </span>

              <span className="ms-1 text-capitalize header-profile-name">
                {userData?.name || userData?.firstName || 'Account'}
              </span>

              {/* <RiArrowDownSLine className="header-user-chip__chevron" /> */}
            </span>
          ) : (
            <>
              <RiUser3Line className="login-signup-icon" />
              <span className="login-signup-text">Login/Signup</span>
            </>
          )}
        </div>
      </div>

      {/* --- COMMENTED OUT: The entire dropdown menu --- */}
      {/* {isLoggedIn && (
        <div className="onhover-div onhover-div-login">
          <ul className="user-box-name">
            <li className="product-box-contain">
              <a href={`/account/my-profile`}>
                <RiUserLine className="me-2" /> My Account
              </a>
            </li>

            <li className="product-box-contain">
              <a href={`/wishlist`}>
                <RiHeart3Line className="me-2" /> Wishlist
              </a>
            </li>

            <li className="product-box-contain">
              <a href={`/bookmarks`}>
                <RiBookmarkLine className="me-2" /> My Bookmarks
              </a>
            </li>

            <li className="product-box-contain" onClick={() => setModal(true)}>
              <a>
                <RiLogoutBoxRLine className="me-2" /> Logout
              </a>
            </li>

            <ConfirmationModal
              modal={modal}
              setModal={setModal}
              confirmFunction={handleLogout}
              isLoading={isLoggingOut}
            />
          </ul>
        </div>
      )} 
      */}

      {/* Kept: OTP Login Modal functionality */}
      <OtpLoginModal
        isOpen={otpModal}
        setOpen={setOtpModal}
        onClose={() => setOtpModal(false)}
      />
    </li>
  );
};

export default HeaderProfile;
