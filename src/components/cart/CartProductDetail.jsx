import Link from 'next/link';
import { placeHolderImage } from '../../data/CommonPath';
import Avatar from '../common/Avatar';
import { useContext } from 'react';
import { useTranslation } from '@/utils/translations';

const CartProductDetail = ({ elem }) => {
  const { t } = useTranslation('common');
  return (
    <td className="product-detail">
      <div className="product border-0">
        <Link
          prefetch={false}
          href={`/products/${elem?.product?.slug}`}
          className="product-image"
        >
          <Avatar
            customImageClass={'img-fluid'}
            data={
              elem?.variation?.variation_image ??
              elem?.product?.product_thumbnail
            }
            placeHolder={placeHolderImage}
            name={elem?.product?.name}
          />
        </Link>
        <div className="product-detail">
          <ul>
            <li className="name">
              <Link prefetch={false} href={`/products/${elem?.product?.slug}`}>
                {elem?.variation?.name ?? elem?.product?.name}
              </Link>
            </li>
            <li className="text-content">
              <span className="text-title">{t('SoldBy')} : </span>{' '}
              {t('Fastkart')}
            </li>
            <li className="text-content">
              <span className="text-title">{t('Unit')}</span> :{' '}
              {elem?.variation?.unit ?? elem?.product?.unit}
            </li>
          </ul>
        </div>
      </div>
    </td>
  );
};

export default CartProductDetail;
