import React, { useState } from 'react';
import AccountContext from '.';

const AccountProvider = (props) => {
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const [accountData, setAccountData] = useState();

  return (
    <AccountContext.Provider
      value={{
        ...props,
        accountData,
        setAccountData,
        mobileSideBar,
        setMobileSideBar,
      }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
