import React, { useContext, useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import CartContext from '@/helper/cartContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { RiShoppingCartLine } from 'react-icons/ri';

const HeaderCartData = dynamic(() => import('./HeaderCartData'), {
  ssr: false,
});

const HeaderCart = () => {
  const { themeOption, cartCanvas, setCartCanvas } =
    useContext(ThemeOptionContext);
  const { cartValue } = useContext(CartContext);
  const cartStyle = useMemo(() => {
    return themeOption?.general?.cart_style
      ? themeOption?.general?.cart_style
      : 'cart_sidebar';
  }, [themeOption]);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (cartCanvas) {
      setIsMounted(true);
    }
  }, [cartCanvas]);

  const cartCount = Math.max(0, Number(cartValue || 0));

  return (
    <li className="right-side right-side--cart">
      <div 
        className="onhover-dropdown header-badge header-cart-box"
        onMouseEnter={() => setIsMounted(true)}
      >
        <button
          className="btn p-0 position-relative header-wishlist header-icon-label-btn header-cart-box border-0"
          aria-label="Cart"
          onClick={() => {
            setIsMounted(true);
            if (cartStyle == 'cart_sidebar') {
              setCartCanvas(!cartCanvas);
            }
          }}
        >
          <span className="header-icon-wrap">
            <RiShoppingCartLine className="header-icon" />
            {cartCount > 0 && (
              <span className="header-icon-badge">{cartCount}</span>
            )}
          </span>
          <span className="header-icon-label">Cart</span>
        </button>
        {isMounted && <HeaderCartData cartStyle={cartStyle} />}
      </div>
    </li>
  );
};

export default HeaderCart;
