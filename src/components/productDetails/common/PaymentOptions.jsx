import { useContext } from 'react';
import Image from 'next/image';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useTranslation } from '@/utils/translations';

const PaymentOptions = ({ productState }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { t } = useTranslation('common');
  return (
    <>
      {themeOption?.product?.safe_checkout &&
      productState?.product?.safe_checkout ? (
        <div className="payment-option">
          <div className="product-title">
            <h4>{t('GuaranteedSafeCheckout')}</h4>
            <Image
              src={themeOption?.product?.safe_checkout_image}
              alt="Safe Checkout"
              className="img-fluid payment-img"
              height={33}
              width={301}
              unoptimized
            />
          </div>
        </div>
      ) : null}
      {themeOption?.product?.secure_checkout &&
      productState?.product?.secure_checkout ? (
        <div className="secure-site-sec">
          <h4>{t('SecureCheckout')}</h4>
          <Image
            src={themeOption?.product?.secure_checkout_image}
            alt="Secure Checkout"
            className="img-fluid payment-img"
            height={26}
            width={376}
            unoptimized
          />
        </div>
      ) : null}
    </>
  );
};

export default PaymentOptions;
