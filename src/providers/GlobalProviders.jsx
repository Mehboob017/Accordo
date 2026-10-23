'use client';

import React from 'react';
import ReactQueryProvider from '@/helper/reactQueryContext/ReactQueryProvider';
import ThemeOptionProvider from '@/helper/themeOptionsContext/ThemeOptionProvider';
import UserProvider from '@/helper/userContext/UserProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import AccountProvider from '@/helper/accountContext/AccountProvider';
import { LanguageProvider } from '@/helper/languageContext/LanguageContextProvider';
import ProductIdsProvider from '@/helper/productIdsContext/ProductIdsProvider';
import CartProvider from '@/helper/cartContext/CartProvider';
import WishlistProvider from '@/helper/wishlistContext/WishlistProvider';
import CategoryProvider from '@/helper/categoryContext/CategoryProvider';
import ProductProvider from '@/helper/productContext/ProductProvider';
import SettingProvider from '@/helper/settingContext/SettingProvider';

// Essential providers needed globally across most routes
const providers = [
  ThemeOptionProvider,
  UserProvider,
  ThemeProvider,
  AccountProvider,
  LanguageProvider,
  ProductIdsProvider,
  CartProvider,
  WishlistProvider,
  CategoryProvider,
  ProductProvider,
  SettingProvider,
];

export default function GlobalProviders({ children, dehydratedState }) {
  return (
    <ReactQueryProvider dehydratedState={dehydratedState}>
      {providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)}
    </ReactQueryProvider>
  );
}