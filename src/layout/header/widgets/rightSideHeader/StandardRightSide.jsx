import { Fragment, useContext, useMemo } from 'react';
import Link from 'next/link';
import { optionList } from '../../../../data/Custom';
import CartContext from '@/helper/cartContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import HeaderCartData from './HeaderCartData';
const StandardRightSide = () => {
  const { cartProducts } = useContext(CartContext);
  const { themeOption, cartCanvas, setCartCanvas } =
    useContext(ThemeOptionContext);
  const cartStyle = useMemo(() => {
    return themeOption?.general?.cart_style
      ? themeOption?.general?.cart_style
      : 'cart_sidebar';
  });
  return (
    <div className="rightside-menu">
      <div className="option-list">
        <ul>
          {optionList.map((elem) => (
            <Fragment key={elem.id}>
              <li
                className="onhover-dropdown"
                onClick={() =>
                  elem?.isBadge &&
                  cartStyle == 'cart_sidebar' &&
                  setCartCanvas(!cartCanvas)
                }
              >
                {elem?.path ? (
                  <Link
                    href={`${elem?.path}`}
                    className={`header-icon ${elem.customClass ? elem.customClass : ''}`}
                  >
                    {elem.icon}
                  </Link>
                ) : (
                  <a
                    className={`header-icon ${elem.customClass ? elem.customClass : ''}`}
                  >
                    {elem?.isBadge && cartProducts?.length > 0 && (
                      <small className="badge-number">
                        {cartProducts?.length}
                      </small>
                    )}
                    {elem.icon}
                  </a>
                )}
                {elem.isBadge && <HeaderCartData cartStyle={cartStyle} />}
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StandardRightSide;
