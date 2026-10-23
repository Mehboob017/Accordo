'use client';

import { useContext } from 'react';
import { Col } from 'reactstrap';
import ProductDetails from '../product4Image/ProductDetails';
import OfferTimer from './OfferTimer';
import ProductDetailAction from './ProductDetailAction';
import AddProductDetail from './AddProductDetail';
import ProductInformation from './ProductInformation';
import PaymentOptions from './PaymentOptions';
import ProductSocial from './ProductSocial';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import ProductBundle from './ProductBundle';
import ProductAttribute from './productAttribute/ProductAttribute';
import ProductDeliveryInformation from './ProductDeliveryInformation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RiCopperCoinLine, RiHome3Fill } from 'react-icons/ri';
import { getProductEarnedSdlCoins } from '@/utils/cart/cartUtils';

const MainProductContent = ({ productState, setProductState }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { productSlug } = useParams();
  const selectedVariation = productState?.selectedVariation;
  const superCoins = getProductEarnedSdlCoins({
    selectedVariation,
    product: productState?.product,
  });
  return (
    <>
      <Col xl={6}>
        <div className="right-box-contain">
          <div className="breadscrumb-contain">
            <nav>
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link href="/">
                    {/* <RiHome3Fill /> */}
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/collections">Products Range</Link>
                </li>
                {[{ name: productSlug }]?.map((result, i) => (
                  <li
                    className="breadcrumb-item active text-capitalize"
                    key={i}
                  >
                    {result?.name}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <ProductDetails productState={productState} />
          {productState?.product?.type == 'classified' && (
            <ProductAttribute
              productState={productState}
              setProductState={setProductState}
            />
          )}
          {superCoins > 0 && (
            <div className="variation-coin-inline">
              <span className="variation-coin-inline__text">
                Earn{' '}
                <RiCopperCoinLine className="variation-coin-inline__icon" />{' '}
                {superCoins} SDL Points
              </span>
            </div>
          )}
          {/* {productState?.product?.sale_starts_at &&
            productState?.product?.sale_expired_at && (
              <OfferTimer productState={productState} />
            )} */}
          <ProductDetailAction
            productState={productState}
            setProductState={setProductState}
          />
          {/* <AddProductDetail productState={productState} /> */}
          {/* <ProductInformation productState={productState} /> */}
          <div className="pickup-box-flex">
            <div className="product-title">
              <h4>Monograph</h4>
            </div>
            <div className="product-info mt-0">
              <a href="#">monograph-reference-link</a>
            </div>
          </div>
          <div className="pickup-box-flex">
            <div className="product-title">
              <h4>Expiry</h4>
            </div>
            <div className="product-info mt-0">
              <span>Best before 9 months from the date of manufacture</span>
            </div>
          </div>
          <div className="pickup-box-flex">
            <div className="product-title">
              <h4>Manufacturer</h4>
            </div>
            <div className="product-info mt-0">
              <span>Made by SDL Life Sciences Pvt. Ltd.</span>
            </div>
          </div>
          <div className="pickup-box-flex">
            <div className="product-title">
              <h4>Marketed By</h4>
            </div>
            <div className="product-info mt-0">
              <span>Distributed by SDL Healthcare Partners</span>
            </div>
          </div>
          <div className="pickup-box-flex">
            <div className="product-title">
              <h4>Return Policy</h4>
            </div>
            <div className="product-info mt-0">
              <span>
                7 days return policy. No return on opening the product.
              </span>
            </div>
          </div>
          {/* {productState?.product?.estimated_delivery_text ||
          (productState?.product?.return_policy_text &&
            productState?.product?.is_return) ? (
            <ProductDeliveryInformation productState={productState} />
          ) : null} */}
          {/* <PaymentOptions productState={productState} /> */}
          {themeOption?.product?.social_share &&
          productState?.product?.social_share ? (
            <ProductSocial productState={productState} />
          ) : null}
        </div>
      </Col>
      {/* {productState?.product?.cross_sell_products?.length > 0 && (
        <Col xs={12} className="related-product-2">
          <ProductBundle productState={productState} />
        </Col>
      )} */}
    </>
  );
};

export default MainProductContent;
