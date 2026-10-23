import { useContext } from 'react';
import { Input, Label } from 'reactstrap';
import AccountContext from '@/helper/accountContext';
import SettingContext from '@/helper/settingContext';
import { useTranslation } from '@/utils/translations';

// Custom function to convert currency to Rupees (₹)
const convertToRupees = (value) => {
  const amount = Number(value);
  return `₹ ${amount.toFixed(2)}`;
};

const PointWallet = ({ values, setFieldValue, checkoutData }) => {
  // Commented out dollar icon code - using convertCurrency (default $ symbol)
  // const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation('common');
  const { accountData } = useContext(AccountContext);
  return (
    <>
      {accountData?.point?.balance > 0 &&
      checkoutData?.total?.convert_point_amount ? (
        <>
          <li>
            <h4
              className={`${values['points_amount'] ? 'fw-bold txt-primary' : 'text-muted'}`}
            >
              {t('Points')}
            </h4>
            <h4
              className={`${values['points_amount'] ? 'price fw-bold txt-primary' : 'price text-muted'}`}
            >
              {/* Commented out dollar icon code */}
              {/* {convertCurrency(checkoutData?.total?.convert_point_amount || 0)} */}
              {/* Rupees icon code */}
              {convertToRupees(checkoutData?.total?.convert_point_amount || 0)}
            </h4>
          </li>
          <li className="border-cls">
            <Label className="form-check-label m-0">
              {t('WouldYouPreferToPayUsingPoints')}?
            </Label>
            <Input
              type="checkbox"
              className="checkbox_animated check-it"
              checked={values['points_amount'] ? true : false}
              onChange={(e) => {
                setFieldValue('points_amount', !values['points_amount']);
              }}
            />
          </li>
        </>
      ) : null}
      {accountData?.wallet?.balance > 0 &&
      checkoutData?.total?.convert_wallet_balance ? (
        <>
          <li>
            <h4
              className={`${values['wallet_balance'] ? 'fw-bold txt-primary' : 'text-muted'}`}
            >
              {t('WalletBalance')}
            </h4>
            <h4
              className={`${values['wallet_balance'] ? 'price fw-bold txt-primary' : 'price text-muted'}`}
            >
              {/* Commented out dollar icon code */}
              {/* {convertCurrency(
                checkoutData?.total?.convert_wallet_balance || 0
              )} */}
              {/* Rupees icon code */}
              {convertToRupees(
                checkoutData?.total?.convert_wallet_balance || 0
              )}
            </h4>
          </li>
          <li className="border-cls">
            <Label className="form-check-label m-0">
              {t('WouldYouPreferToPayUsingWallet')}?
            </Label>
            <Input
              type="checkbox"
              className="checkbox_animated check-it"
              onChange={(e) => {
                setFieldValue('wallet_balance', !values['wallet_balance']);
              }}
            />
          </li>
        </>
      ) : null}
    </>
  );
};

export default PointWallet;
