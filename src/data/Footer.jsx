import {
  RiAppsLine,
  RiAppsFill,
  RiBox2Line,
  RiBox2Fill,
  RiHome2Line,
  RiHome2Fill,
  RiUser6Line,
  RiUser6Fill,
} from 'react-icons/ri';

export const footerMenuItems = [
  {
    id: 1,
    title: 'Home',
    active: true,
    fillIcon: <RiHome2Fill className="activated" />,
    lineIcon: <RiHome2Line className="deactivated" />,
    path: '/',
  },
  // {
  //   id: 2,
  //   title: 'Category',
  //   className: 'mobile-category',
  //   active: false,
  //   fillIcon: <RiAppsFill className="activated" />,
  //   lineIcon: <RiAppsLine className="deactivated" />,
  //   path: '/collections',
  // },
  {
    id: 3,
    title: 'Products',
    active: false,
    fillIcon: <RiBox2Fill className="activated" />,
    lineIcon: <RiBox2Line className="deactivated" />,
    path: '/collections',
  },
  {
    id: 4,
    title: 'Profile',
    className: 'footer-profile',
    active: false,
    fillIcon: <RiUser6Fill className="activated" />,
    lineIcon: <RiUser6Line className="deactivated" />,
    path: '#',
  },
];
