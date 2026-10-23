import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import SettingContext from '.';
import settingJson from '@/app/api/settings/setting.json';

const SettingProvider = (props) => {
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [settingData, setSettingData] = useState({});
  const [settingObj, setSettingObj] = useState({});

  const data = settingJson?.values;
  const isLoading = false;
  useEffect(() => {
    if (data) {
      if (data?.maintenance?.maintenance_mode) {
        Cookies.set('maintenance', JSON.stringify(true));
        // console.log('Maintenance mode enabled SettingProvider');
      } else {
        // console.log('Maintenance mode disabled SettingProvider');
        Cookies.remove('maintenance');
      }
      setSettingData(data);
      setSettingObj(data);
    }
  }, [data]);

  // Convert Currency as per Exchange Rate
  const convertCurrency = useCallback((value) => {
    const symbol = '₹';
    const amount = Number(value) || 0;

    return `${symbol}${amount.toFixed(2)}`;
  }, []);

  return (
    <SettingContext.Provider
      value={{
        ...props,
        settingData,
        convertCurrency,
        selectedCurrency,
        setSelectedCurrency,
      }}
    >
      {props.children}
    </SettingContext.Provider>
  );
};
export default SettingProvider;
