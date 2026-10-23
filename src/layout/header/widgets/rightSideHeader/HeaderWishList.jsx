import Link from 'next/link';
import { useContext, useMemo, useState } from 'react';
import { RiHeartLine } from 'react-icons/ri';
import WishlistContext from '@/helper/wishlistContext';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { useUser } from '@/utils/hooks/useUser';

const WISHLIST_FALLBACK_URL_KEY = 'wishlistFallbackUrl';

const HeaderWishList = ({ wishListIcon }) => {
  const { wishlistProducts } = useContext(WishlistContext);
  const { isAuthenticated } = useUser();
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const wishlistCount = wishlistProducts?.length || 0;
  const wishlistRedirectUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/wishlist';
    }

    return sessionStorage.getItem(WISHLIST_FALLBACK_URL_KEY) || '/wishlist';
  }, [otpModalOpen]);

  const handleWishlistClick = (event) => {
    if (isAuthenticated) {
      return;
    }

    event.preventDefault();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(WISHLIST_FALLBACK_URL_KEY, '/wishlist');
    }

    setOtpModalOpen(true);
  };

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(WISHLIST_FALLBACK_URL_KEY);
    }
    setOtpModalOpen(false);
  };

  const handleOtpClose = () => {
    setOtpModalOpen(false);
  };

  return (
    <>
      <li className="right-side right-side--wishlist">
        <Link
          prefetch={false}
          href={'/wishlist'}
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          className="btn p-0 position-relative header-wishlist header-icon-label-btn header-wishlist-box border-0"
        >
          <span className="header-icon-wrap">
            {wishListIcon ? (
              <span className="header-icon">{wishListIcon}</span>
            ) : (
              <RiHeartLine className="header-icon" />
            )}
            {wishlistCount > 0 && (
              <span className="header-icon-badge">{wishlistCount}</span>
            )}
          </span>
          <span className="header-icon-label">Wishlist</span>
        </Link>
      </li>

      <OtpLoginModal
        isOpen={otpModalOpen}
        onClose={handleOtpClose}
        setOpen={setOtpModalOpen}
        redirectUrl={wishlistRedirectUrl}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default HeaderWishList;
