import { RiBookmarkLine, RiCoinLine, RiFileList3Line, RiFileTextLine, RiHeart3Line, RiMapPinLine, RiUserLine } from 'react-icons/ri';

export const sidebarMenu = [
  {
    id: 'profile',
    title: 'My Profile',
    icon: <RiUserLine />,
    path: '/account/my-profile',
  },
  {
    id: 'orders',
    title: 'My Orders',
    icon: <RiFileTextLine />,
    path: '/account/orders',
  },
  {
    id: 'points',
    title: 'SDL Points',
    icon: <RiCoinLine />,
    path: '/account/coins',
  },
  {
    id: 'addresses',
    title: 'Saved Addresses',
    icon: <RiMapPinLine />,
    path: '/account/addresses',
  },
  // {
  //   id: 'track-orders',
  //   title: 'Track Orders',
  // icon: <RiFileList3Line />,
  //   path: '/track-orders',
  // },
  {
    id: 'wishlist',
    title: 'Wishlist',
    icon: <RiHeart3Line />,
    path: '/wishlist',
  },
  {
    id: 'bookmarks',
    title: 'My Bookmarks',
    icon: <RiBookmarkLine />,
    path: '/bookmarks',
  },
];
