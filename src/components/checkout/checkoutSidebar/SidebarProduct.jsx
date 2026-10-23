import React, { useContext } from 'react';
import { CardBody, Input, InputGroup } from 'reactstrap';
import Image from 'next/image';
import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import CartContext from '@/helper/cartContext';
import { placeHolderImage } from '../../../data/CommonPath';
import Btn from '@/elements/buttons/Btn';

// Currency helper
const convertToRupees = (value) => `₹${Number(value).toFixed(0)}`;
const getImageUrl = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === 'string' && source.trim()) return source;
    if (typeof source === 'object') {
      if (typeof source.original_url === 'string' && source.original_url.trim()) {
        return source.original_url;
      }
      if (typeof source.url === 'string' && source.url.trim()) return source.url;
      if (typeof source.src === 'string' && source.src.trim()) return source.src;
    }
  }
  return placeHolderImage;
};

const SidebarProduct = ({
  checkoutProducts,
  isInstantBuy,
  isLoading = false,
  emptyMessage = 'Your cart is empty',
  showQuantityControls = false,
  onIncrease,
  onDecrease,
}) => {
  const { cartProducts, handleIncDec } = useContext(CartContext);
  const router = useRouter();

  // Use checkoutProducts if provided (for instant buy), otherwise use cartProducts
  const displayProducts = checkoutProducts || cartProducts;

  const goToProductDetails = (productSlug) => {
    if (!productSlug) return;
    router.push(`/products/${productSlug}`);
  };

  return (
    <CardBody>
      <ul className="order-items">
        {/* {isLoading && (
          <li className="text-center text-muted py-3">Loading checkout item...</li>
        )} */}
        {!isLoading && displayProducts?.length === 0 && (
          <li className="text-center py-3" style={{color: "#9e9e9e"}}>{emptyMessage}</li>
        )}
        {displayProducts?.map((item, index) => {
          const product = item?.product || {};
          const variation = item?.variation || item?.variant || {};
          const pricing = item?.pricing || {};

          const image = getImageUrl(
            variation?.variation_image,
            variation?.image,
            item?.image,
            item?.product_thumbnail,
            product?.coverImage,
            product?.product_thumbnail
          );

          const productName = product?.name || item?.name || 'Product';
          const variantName =
            variation?.name ||
            item?.variant_name ||
            item?.variantName ||
            item?.unit ||
            variation?.unit ||
            product?.unit ||
            'Standard';
          const salePrice = Number(
            pricing?.snapPrice ||
              item?.sale_price ||
              item?.salePrice ||
              variation?.sale_price ||
              product?.sale_price ||
              item?.price ||
              variation?.price ||
              product?.price ||
              0
          );
          const mrp = Number(
            pricing?.snapMrp ||
              item?.price ||
              variation?.mrp ||
              variation?.price ||
              product?.price ||
              salePrice
          );
          const quantity = Number(item?.quantity || pricing?.quantity || 1);
          const payableAmount = Number(
            pricing?.payableAmount ?? salePrice * quantity
          );
          const couponDiscountAmount = Number(pricing?.discountCodeAmount ?? 0);
          const offerDiscountAmount = Number(pricing?.offerDiscountAmount ?? 0);
          const coinDiscountAmount = Number(
            pricing?.coinDiscountAmount ?? pricing?.coinDiscount ?? 0
          );
          const slabDiscountAmount = Number(pricing?.slabDiscountAmount ?? 0);
          const totalDiscountAmount =
            Math.max(0, couponDiscountAmount) +
            Math.max(0, offerDiscountAmount) +
            Math.max(0, coinDiscountAmount) +
            Math.max(0, slabDiscountAmount);
          const mrpTotal = mrp * quantity;
          const productSlug = item?.slug || product?.slug;

          return (
            <li
              className="order-item"
              key={item?.id || `${item?.product_id || 'product'}-${item?.variation_id || index}`}
            >
              <div className="thumb">
                <Image
                  src={image}
                  alt={productName}
                  width={48}
                  height={48}
                  draggable={false}
                  unoptimized
                  onClick={() => goToProductDetails(productSlug)}
                  style={{ cursor: productSlug ? 'pointer' : 'default' }}
                />
              </div>

              <div className="info">
                {/* product name */}
                <span
                  className="name"
                  role="button"
                  tabIndex={0}
                  onClick={() => goToProductDetails(productSlug)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      goToProductDetails(productSlug);
                    }
                  }}
                  style={{ cursor: productSlug ? 'pointer' : 'default' }}
                >
                  {productName}
                </span>
                {/* variant name */}
                <span className="meta">{variantName}</span>
                {totalDiscountAmount > 0 && (
                  <span className="meta success fw-bold d-block">
                    Discount - {convertToRupees(totalDiscountAmount)}
                  </span>
                )}
              </div>

              {(showQuantityControls || isInstantBuy) && (
                <div className="cart_qty">
                  <InputGroup>
                    <Btn
                      type="button"
                      className="btn qty-left-minus"
                      onClick={() => {
                        if (typeof onDecrease === 'function') {
                          onDecrease(item);
                          return;
                        }

                        handleIncDec(-1, product, quantity, null, null, item, false);
                      }}
                    >
                      <RiSubtractLine />
                    </Btn>
                    <Input
                      className="input-number qty-input"
                      type="text"
                      name="quantity"
                      value={quantity}
                      readOnly
                    />
                    <Btn
                      type="button"
                      className="btn qty-right-plus"
                      onClick={() => {
                        if (typeof onIncrease === 'function') {
                          onIncrease(item);
                          return;
                        }

                        handleIncDec(1, product, quantity, null, null, item, false);
                      }}
                    >
                      <RiAddLine />
                    </Btn>
                  </InputGroup>
                </div>
              )}

              <div className="price">
                <span className="current">
                  {convertToRupees(payableAmount)}
                </span>

                {mrpTotal > payableAmount && (
                  <del>{convertToRupees(mrpTotal)}</del>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </CardBody>
  );
};

export default SidebarProduct;
