'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SubLayout from './SubLayout';
import GlobalProviders from '@/providers/GlobalProviders';

// Dynamic imports for components/providers not needed for initial paint
const DynamicToastContainer = dynamic(
  () => import('react-toastify').then((mod) => mod.ToastContainer),
  { ssr: false }
);

const MainLayout = ({ children, dehydratedState }) => {
  return (
    <>
      <GlobalProviders dehydratedState={dehydratedState}>
        <SubLayout>{children}</SubLayout>
      </GlobalProviders>

      <DynamicToastContainer
        theme="light"
        position="top-right"
        autoClose={1200}
        hideProgressBar={true}
        closeOnClick
        stacked
        draggable
        draggablePercent={30}
        newestOnTop
        toastClassName="app-toast"
        bodyClassName="app-toast-body"
        progressClassName="app-toast-progress"
        className="responsive-toast-container"
      />
    </>
  );
};

export default MainLayout;

// 'use client';
// import React, { useEffect } from 'react';
// import SubLayout from './SubLayout';
// import ThemeOptionProvider from '@/helper/themeOptionsContext/ThemeOptionProvider';
// import SettingProvider from '@/helper/settingContext/SettingProvider';
// import ProductProvider from '@/helper/productContext/ProductProvider';
// import CategoryProvider from '@/helper/categoryContext/CategoryProvider';
// import AccountProvider from '@/helper/accountContext/AccountProvider';
// import UserProvider from '@/helper/userContext/UserProvider';
// import CartProvider from '@/helper/cartContext/CartProvider';
// import WishlistProvider from '@/helper/wishlistContext/WishlistProvider';
// import { ToastContainer } from 'react-toastify';
// import BlogProvider from '@/helper/blogContext/BlogProvider';
// import ProductIdsProvider from '@/helper/productIdsContext/ProductIdsProvider';
// import ReactQueryProvider from '@/helper/reactQueryContext/ReactQueryProvider';
// import ThemeProvider from '@/providers/ThemeProvider';
// import { LanguageProvider } from './../helper/languageContext/LanguageContextProvider';
// // import WebPreventionCommands from './WebPreventionCommands';
// import AudioUnlockProvider from '@/components/AudioUnlockProvider';


// const MainLayout = ({ children, dehydratedState }) => {
//   return (
//     <>
//       {/* <WebPreventionCommands /> */}
//       <ReactQueryProvider dehydratedState={dehydratedState}>
//         <ThemeOptionProvider>
//           <UserProvider>
//             <ThemeProvider>
//               <AccountProvider>
//                 <LanguageProvider>
//                   <BlogProvider>
//                     <ProductIdsProvider>
//                       <CartProvider>
//                         <WishlistProvider>
//                           <CategoryProvider>
//                             <ProductProvider>
//                               <SettingProvider>
//                                 <AudioUnlockProvider>
//                                   <SubLayout children={children} />
//                                 </AudioUnlockProvider>
//                               </SettingProvider>
//                             </ProductProvider>
//                           </CategoryProvider>
//                         </WishlistProvider>
//                       </CartProvider>
//                     </ProductIdsProvider>
//                   </BlogProvider>
//                 </LanguageProvider>
//               </AccountProvider>
//             </ThemeProvider>
//           </UserProvider>
//         </ThemeOptionProvider>
//       </ReactQueryProvider>
//       <ToastContainer
//         theme="light"
//         position="top-right"
//         autoClose={1200}
//         hideProgressBar={true}
//         closeOnClick
//         // pauseOnHover
//         stacked
//         draggable
//         draggablePercent={30}
//         newestOnTop
//         toastClassName="app-toast"
//         bodyClassName="app-toast-body"
//         progressClassName="app-toast-progress"
//         className="responsive-toast-container"
//       />
//     </>
//   );
// };

// export default MainLayout;