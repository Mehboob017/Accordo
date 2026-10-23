import { useTranslation } from '@/utils/translations';
import { useContext } from 'react';
import { RiArrowLeftRightLine, RiTruckLine } from 'react-icons/ri';

const ProductDeliveryInformation = ({ productState }) => {
  const { t } = useTranslation('common');
  return (
    <div className="delivery-info">
      <div className="product-title">
        <h4>{t('DeliveryDetails')}</h4>
      </div>
      <ul>
        {productState?.product?.estimated_delivery_text ? (
          <li>
            <RiTruckLine className="me-2" />{' '}
            {productState?.product?.estimated_delivery_text}
          </li>
        ) : null}
        {productState?.product?.return_policy_text ? (
          <li>
            <RiArrowLeftRightLine className="me-2" />
            {productState?.product?.return_policy_text}
          </li>
        ) : null}
      </ul>
    </div>
  );
};

export default ProductDeliveryInformation;
