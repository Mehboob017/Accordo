'use client';

import { RiHeartLine, RiHeartFill } from 'react-icons/ri';
import { useState } from 'react';
import {
  useAddToWishlist,
  useIsInWishlist,
  useRemoveFromWishlist,
} from '@/utils/hooks/useWishlist';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  POST_LOGIN_ACTIONS,
  storePendingPostLoginAction,
} from '@/utils/postLoginAction';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';

const AddToWishlistNew = ({ productObj, isActive = false, onRemoveClick }) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const isProductInWishlist = useIsInWishlist(productObj?.uid);
  const wishlistButtonActive = onRemoveClick && isActive ? true : isProductInWishlist;
  const isMutationPending =
    isProcessing ||
    addToWishlistMutation.isPending ||
    removeFromWishlistMutation.isPending;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMutationPending) return;

    setIsProcessing(true);

    try {
      if (onRemoveClick) {
        onRemoveClick(productObj);
        return;
      }

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('userToken');

        if (!token) {
          if (productObj?.uid) {
            storePendingPostLoginAction({
              type: POST_LOGIN_ACTIONS.WISHLIST_PRODUCT,
              productId: productObj.uid,
            });
          }

          setLoginModalOpen(true);
          return;
        }
      }

      if (!productObj?.uid) return;

      if (isProductInWishlist) {
        await removeFromWishlistMutation.mutateAsync({
          productUid: productObj.uid,
          add: false,
        });

        ToastNotification('success', 'Product removed from wishlist.');
      } else {
        const data = await addToWishlistMutation.mutateAsync({
          productUid: productObj.uid,
          add: true,
        });

        if (data?.success) {
          ToastNotification(
            'success',
            data.message || 'Wishlist updated successfully'
          );
        }
      }
    } catch (error) {
      ToastNotification('error', error?.message || 'Failed to update wishlist');
    } finally {
      setIsProcessing(false);
    }
  };

  const iconStyle = {
    color: wishlistButtonActive ? 'var(--wishlist-filled)' : 'inherit',
    transition: 'color 0.2s ease, background-color 0.2s ease',
    fontSize: '1.125rem',
  };

  const positionStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 4,
  };

  // console.log({ productObj, isProductInWishlist });

  return (
    <>
      <div
        title="Wishlist"
        style={positionStyle}
        className={wishlistButtonActive ? 'active' : ''}
      >
        <button
          type="button"
          aria-label="Add to Wishlist"
          className={`notifi-wishlist-new ${wishlistButtonActive ? 'active' : ''
            } ${isMutationPending ? 'loading' : ''}`}
          onClick={handleClick}
          disabled={isMutationPending}
        >
          {wishlistButtonActive ? (
            <RiHeartFill style={iconStyle} />
          ) : (
            <RiHeartLine style={iconStyle} />
          )}
        </button>
      </div>
      <OtpLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        setOpen={setLoginModalOpen}
      // redirectUrl="/wishlist"
      />
    </>
  );
};

export default AddToWishlistNew;
