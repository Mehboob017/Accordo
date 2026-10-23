'use client';
import { useState } from 'react';
import { Col, Row } from 'reactstrap';
import Link from 'next/link';
import { RiHeartLine } from 'react-icons/ri';
import WrapperComponent from '../common/WrapperComponent';
import ProductBox1 from '../common/productBox/productBox1/ProductBox1';
import OtpLoginModal from '../auth/login/OtpLoginModal';
import { useWishlist, useRemoveFromWishlist } from '@/utils/hooks/useWishlist';
import { useUser } from '@/utils/hooks/useUser';
import Btn from '@/elements/buttons/Btn';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { normalizeProductForCard } from '@/utils/fallbackProducts';
import ProductSkeletonComponent from '@/components/common/skeletonLoader/productSkeleton/ProductSkeletonComponent';

const WishlistContent = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // 1. Fetch authentication state
  const { isAuthenticated, isLoading: isAuthLoading } = useUser();

  // 2. Fetch wishlist state
  const {
    data,
    isLoading: isWishlistLoading,
    isFetching: isWishlistFetching,
  } = useWishlist({
    page: 1,
    limit: 20,
  });

  const handleRemoveClick = (product) => {
    removeFromWishlistMutation.mutate(
      { productUid: product?.uid, add: false },
      {
        onSuccess: (data) => {
          ToastNotification(
            'success',
            data?.message || 'Product removed from wishlist.'
          );
        },
        onError: (error) => {
          ToastNotification(
            'error',
            error?.message || 'Failed to update wishlist'
          );
        },
      }
    );
  };

  const normalizeProduct = (wishlistItem) => {
    return normalizeProductForCard(wishlistItem?.product);
  };

  const wishlistProducts =
    data?.success && data?.data?.wishlist
      ? data.data.wishlist.map(normalizeProduct).filter(Boolean)
      : [];

  // --- STATE 1: LOADING (Auth check OR Wishlist data fetch) ---
  const isPageLoading =
    isAuthLoading ||
    isWishlistLoading ||
    isWishlistFetching ||
    (isAuthenticated && data === undefined);

  if (isPageLoading) {
    return (
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
      >
        <Row className="g-sm-4 g-3 product-list-section">
          <ProductSkeletonComponent item={8} />
        </Row>
      </WrapperComponent>
    );
  }

  // --- STATE 2: NOT AUTHENTICATED (Show Shop Now / Login Section) ---
  if (!isAuthenticated) {
    return (
      <>
        <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
          <div className="empty-cart-box my-5 text-center no-data-added">
            <div className="empty-icon">
              <RiHeartLine />
            </div>
            <h4>Login to see your wishlist</h4>
            <p>Please login to see your preferred ayurvedic medicines & wellness products</p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              {/* <Link
                href="/collections"
                className="btn btn-md btn-primary d-inline-block"
              >
                Shop Now
              </Link> */}
              <Btn
                color="primary"
                onClick={() => setLoginModalOpen(true)}
                className="btn btn-md d-inline-block"
              >
                Login
              </Btn>
            </div>
          </div>
        </WrapperComponent>

        <OtpLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          setOpen={setLoginModalOpen}
        />
      </>
    );
  }

  // --- STATE 3: AUTHENTICATED BUT WISHLIST IS EMPTY ---
  if (!wishlistProducts?.length) {
    return (
      <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
        <div className="empty-cart-box my-5 text-center no-data-added">
          <div className="empty-icon">
            <RiHeartLine />
          </div>
          <h4>Your Wishlist is Empty</h4>
          <p>
            Save your preferred Ayurvedic medicines and wellness products for easy access whenever you need them.
          </p>
          <Link
            href="/collections"
            className="btn btn-md btn-primary mt-3 d-inline-block"
          >
            Explore Products
          </Link>
        </div>
      </WrapperComponent>
    );
  }

  // --- STATE 4: FINAL RENDER (Authenticated & Items Found) ---
  return (
    <WrapperComponent classes={{ sectionClass: 'section-b-space' }} noRowCol>
      <Row className="g-sm-4 g-3 product-list-section">
        {wishlistProducts.map((product) => (
          <Col xl={3} lg={4} md={6} xs={6} key={product.id}>
            <ProductBox1
              imgUrl={product.product_thumbnail}
              productDetail={product}
              classObj={{ productBoxClass: 'product-box-3' }}
              isClose
              onRemoveClick={handleRemoveClick}
            />
          </Col>
        ))}
      </Row>
    </WrapperComponent>
  );
};

export default WishlistContent;
