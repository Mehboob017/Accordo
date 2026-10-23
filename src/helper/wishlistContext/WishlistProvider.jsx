'use client';

import React, { useEffect, useRef, useState } from 'react';
import WishlistContext from '.';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';

const WISHLIST_STORAGE_KEY = 'wishlist_products';

const getStoredWishlist = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const WishlistProvider = (props) => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    setWishlistProducts(getStoredWishlist());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlistProducts)
    );
  }, [wishlistProducts]);

  const addToWishlist = (product) => {
    if (!product?.id) return;
    const exists = wishlistProducts.some((p) => p.id === product.id);
    if (!exists) ToastNotification('success', 'Product added to wishlist.');
    setWishlistProducts((prev) => {
      const existsInPrev = prev.some((p) => p.id === product.id);
      if (existsInPrev) return prev;
      return [...prev, { ...product }];
    });
  };

  const removeFromWishlist = (productId) => {
    const exists = wishlistProducts.some((p) => p.id === productId);
    if (exists) ToastNotification('success', 'Product removed from wishlist.');
    setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleWishlist = (product) => {
    if (!product?.id) return;
    const exists = wishlistProducts.some((p) => p.id === product.id);
    // Only show toast when adding (removal is handled with confirmation in components)
    if (!exists) {
      ToastNotification('success', 'Product added to wishlist.');
    }
    setWishlistProducts((prev) => {
      const existsInPrev = prev.some((p) => p.id === product.id);
      if (existsInPrev) return prev.filter((p) => p.id !== product.id);
      return [...prev, { ...product }];
    });
  };

  const isInWishlist = (productId) =>
    wishlistProducts.some((p) => p.id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistProducts,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
