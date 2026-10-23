import { dateFormat } from '@/utils/customFunctions/DateFormat';
import { ModifyString } from '@/utils/customFunctions/ModifyString';
import { useTranslation } from '@/utils/translations';
import { useContext } from 'react';

const ProductInformation = ({ productState }) => {
  const { t } = useTranslation('common');
  return (
    <div className="pickup-box">
      <div className="product-title">
        <h4>Product Information</h4>
      </div>
      <div className="product-info">
        <ul className="product-info-list">
          <li>
            SKU :{' '}
            {productState?.selectedVariation?.sku ?? productState?.product?.sku}
          </li>
          <li>
            Weight : {productState?.product?.weight}
          </li>
          <li>
            Stock Status :
            {productState?.selectedVariation?.stock_status
              ? ModifyString(
                  productState?.selectedVariation?.stock_status,
                  false,
                  '_'
                )
              : ModifyString(productState?.product?.stock_status, false, '_')}
          </li>
          <li>
            Quantity :{' '}
            {productState?.selectedVariation?.quantity ??
              productState?.product?.quantity}{' '}
            Items Left
          </li>
          <li>
            Date : {dateFormat(productState?.product?.created_at, true)}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductInformation;
