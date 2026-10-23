"use state";

import {useContext} from "react";
import { RiCloseLine } from 'react-icons/ri';
import Image from 'next/image';
import { placeHolderImage } from '@/data/CommonPath';
import SettingContext from '@/helper/settingContext';


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

const AlternativeProductList = ({
  products = [],
  onRemoveAll,
  isRemoving = false,
  title = 'You cannot purchase these items.',
  reason = 'Please create a Vaidya account to purchase these items.',
  removeAriaLabel = 'Remove restricted products',
  hideCloseButton = false,
}) => {
  const { convertCurrency } = useContext(SettingContext);
  
  if (!products.length) {
    return null;
  }

  return (
    <div className="cart-products-list alternative-products">
      <div className="alternative-products__header d-flex align-items-start justify-content-between gap-1">
        <div>
          <h6 className="alternative-products__title">
            {title}
          </h6>
          {reason ? (
            <h6 className="alternative-products__reason">{reason}</h6>
          ) : null}
        </div>
        {!hideCloseButton && (
          <button
            type="button"
            className="btn btn-sm p-0 border-0 bg-transparent"
            onClick={onRemoveAll}
            disabled={isRemoving}
            aria-label={removeAriaLabel}
          >
            <RiCloseLine size={20} />
          </button>
        )}
      </div>
      <ul className="order-items">
        {products.map((item, index) => {
          const quantity = Number(item?.quantity || 1);
          const price = Number(
            item?.variation?.sale_price || item?.product?.sale_price || 0
          );
          const compareAt = Number(
            item?.variation?.price || item?.product?.price || price
          );
          const name = item?.product?.name || item?.name || 'Product';
          const variantName = item?.variation?.name || '';
          const image = getImageUrl(
            item?.variation?.variation_image,
            item?.product?.product_thumbnail,
            item?.image
          );

          return (
            <li className="order-item alternative-products__item" key={index}>
              <div className="thumb alternative-products__thumb">
                <Image
                  src={image}
                  alt={name}
                  width={48}
                  height={48}
                  draggable={false}
                  unoptimized
                />
              </div>

              <div className="info">
                <a href={`/products/${item?.product?.slug || ''}`}>
                  <span className="name">{name}</span>
                </a>
                <span className="meta">
                  {variantName ? `${variantName} • ` : ''}Qty: {quantity}
                </span>
              </div>

              {/* <div className="price alternative-products__price">
                <span className="current">
                  {convertCurrency(price * quantity)}
                </span>
                {compareAt > price && <del>
                  {convertCurrency(compareAt)}
                  </del>}
              </div> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AlternativeProductList;