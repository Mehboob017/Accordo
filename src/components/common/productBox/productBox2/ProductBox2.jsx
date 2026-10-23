import React, { useContext } from 'react';
import Link from 'next/link';
import Avatar from '../../Avatar';
import ProductBox1Rating from '../productBox1/ProductBox1Rating';
import { placeHolderImage } from '../../../../data/CommonPath';
import SettingContext from '@/helper/settingContext';

const ProductBox2 = ({ elem, rating = true, customImageClass }) => {
  const { convertCurrency } = useContext(SettingContext);
  return (
    <div className="offer-product">
      <Link prefetch={false} href={`/products/${elem.slug}`} className="offer-image">
        <Avatar
          data={elem?.product_thumbnail}
          placeHolder={placeHolderImage}
          name={elem?.name}
          customImageClass={customImageClass}
          height={500}
          width={500}
        />
      </Link>

      <div className="offer-detail">
        <div>
          <Link
            prefetch={false}
            href={`/products/${elem.slug}`}
            className="text-title"
          >
            <h6 className="name">{elem?.name}</h6>
          </Link>
          {rating ? (
            <ProductBox1Rating totalRating={elem?.rating_count} />
          ) : (
            <span>{elem?.unit}</span>
          )}
          <h5 className="price theme-color">
            {convertCurrency(elem?.sale_price)}
            <del className="text-content">{convertCurrency(elem?.price)}</del>
          </h5>
        </div>
      </div>
    </div>
  );
};

export default ProductBox2;
