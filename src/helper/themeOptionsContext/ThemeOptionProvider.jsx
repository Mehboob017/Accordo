'use client';
import React, { useState } from 'react';
import ThemeOptionContext from '.';
import themeOptionData from '@/data/themeOption.json';

const ThemeOptionProvider = (props) => {
  const [openOffCanvas, setOpenOffCanvas] = useState(false);
  const [cartCanvas, setCartCanvas] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const [collectionMobile, setCollectionMobile] = useState(false);
  
  // Use the imported JSON directly for initial state
  const [themeOption, setThemeOption] = useState(themeOptionData?.options || {});
  
  // To avoid breaking consumers that might rely on isLoading
  const isLoading = false;

  return (
    <>
      <ThemeOptionContext.Provider
        value={{
          ...props,
          themeOption,
          openOffCanvas,
          setOpenOffCanvas,
          cartCanvas,
          setCartCanvas,
          mobileSideBar,
          setMobileSideBar,
          collectionMobile,
          setCollectionMobile,
          isLoading,
        }}
      >
        {props.children}
      </ThemeOptionContext.Provider>
    </>
  );
};

export default ThemeOptionProvider;
