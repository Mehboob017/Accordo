import SettingContext from '@/helper/settingContext';
import { useTranslation } from '@/utils/translations';
import React, { useContext } from 'react';

const CartVariationNameDetails = ({ cloneVariation }) => {
  const { t } = useTranslation('common');
  const { convertCurrency } = useContext(SettingContext);
  return (
    <>
      <h3 className="name">
        {cloneVariation?.variation?.name ?? cloneVariation?.product?.name}
      </h3>
      <div className="price-rating">
        <h3 className="theme-color price">
          {cloneVariation?.variation?.sale_price
            ? convertCurrency(cloneVariation?.variation?.sale_price)
            : convertCurrency(cloneVariation?.product?.sale_price)}
          <del className="text-content">
            {convertCurrency(cloneVariation?.variation?.price) ??
              convertCurrency(cloneVariation?.product?.price)}
          </del>
          <span className="offer-top">
            {cloneVariation?.variation?.discount ??
              cloneVariation?.product?.discount}
            % {t('Off')}
          </span>
        </h3>
      </div>
    </>
  );
};

export default CartVariationNameDetails;
