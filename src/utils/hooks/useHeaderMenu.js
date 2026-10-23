import { useQuery } from '@tanstack/react-query';
import { fetchHeaders } from '@/api/headers.api';
import { headerMenu as staticHeaderMenu } from '@/data/HeadersMenu';

const STATIC_TOP_LEVEL_TITLES = ['Home'];
const API_TOP_LEVEL_TITLES = [
  'Shop by Category',
  'Shop by Herbs',
  'Shop by Health Concerns',
  'About Us',
  'Blogs',
];

const STATIC_FALLBACK_TITLES = ['About Us'];

// In useHeaderMenu.js
const STATIC_TRAILING_MENUS = [
  {
    id: 'shop-online',
    title: 'Shop Online',
    customClass: 'nav-item',
    path: '/collections',
  },
  {
    id: 'shop-by-best-seller',
    title: 'Best Sellers',
    customClass: 'nav-item',
    path: '/collections?tags=best-seller',
  },
  {
    id: 'shop-by-combo',
    title: 'Combo Pack',
    customClass: 'nav-item',
    path: '/collections?tags=combo',
  },
];

const STATIC_NEW_MENUS = [
  {
    id: 'AboutUs',
    title: 'About us',
    customClass: 'nav-item',
    path: '/about-us',
  },
  {
    id: 'media',
    title: 'Media',
    customClass: 'nav-item dropdown',
    customChildren: false,
    children: [
      {
        title: 'Press',
        type: 'link',
        path: '/press',
      },
      {
        title: 'Events',
        type: 'link',
        path: '/events',
      },
    ],
  },
  {
    id: 'careers',
    title: 'Careers',
    // customClass: 'nav-item nav-item-careers',
    customClass: 'nav-item',
    path: '/careers',
  },
];

const DYNAMIC_MENU_TITLES = {
  'shop by category': 'Shop by Category',
  'shop by herbs': 'Shop by Herbs',
  'shop by health concern': 'Shop by Health Concerns',
  'shop by health concerns': 'Shop by Health Concerns',
  'shop by health interest': 'Shop by Health Concerns',
  'shop by health interests': 'Shop by Health Concerns',
  'about us': 'About Us',
  blog: 'Blogs',
  blogs: 'Blogs',
};

const normalizeTitle = (title = '') => String(title).trim().toLowerCase();

const normalizeBlogChildren = (item) => {
  if (Array.isArray(item?.children) && item.children.length > 0) {
    return item.children;
  }

  if (!Array.isArray(item?.blogCategories) || item.blogCategories.length === 0) {
    return [];
  }

  return [
    {
      column: [
        {
          title: 'Blog Categories',
          type: 'sub',
        },
        ...item.blogCategories.map((category) => ({
          ...category,
          type: category?.type || 'link',
        })),
      ],
    },
  ];
};

const normalizeMenuChildren = (item, title) => {
  if (title === 'Blogs') {
    return normalizeBlogChildren(item);
  }

  return Array.isArray(item?.children) ? item.children : [];
};

const normalizeDynamicMenuItem = (item) => {
  const title = DYNAMIC_MENU_TITLES[normalizeTitle(item?.title)];

  if (!title) {
    return null;
  }

  // FORCE BLOGS TO BE A SIMPLE LINK
  if (title === 'Blogs') {
    return {
      id: item?.id || 'blogs',
      title: 'Blogs',
      path: '/blogs',
      customClass: 'nav-item',
      // By explicitly NOT including 'children' or 'styleType' here, 
      // MenuList.jsx will completely ignore all dropdown rendering logic.
    };
  }

  // FORCE ABOUT US TO BE A SIMPLE DROPDOWN
  if (title === 'About Us') {
    return {
      id: item?.id || 'about-us',
      title: 'About Us',
      path: undefined,
      customClass: 'nav-item dropdown',
      customChildren: false,
      children: [
        { title: 'Company Profile', type: 'link', path: '/company-profile' },
        { title: 'Leadership', type: 'link', path: '/leadership' },
        { title: 'Manufacturing and Quality', type: 'link', path: '/manufacturing-and-quality' },
        { title: 'Our Legacy', type: 'link', path: '/our-legacy' },
        { title: 'Associations and Initiatives', type: 'link', path: '/associations-and-initiatives' },
      ],
    };
  }

  const children = normalizeMenuChildren(item, title);
  const hasChildren = Array.isArray(children) && children.length > 0;

  return {
    ...item,
    title,
    path: hasChildren ? undefined : item?.path,
    styleType: item?.styleType || 'link',
    customClass: item?.customClass || 'nav-item dropdown',
    customChildren:
      typeof item?.customChildren === 'boolean' ? item.customChildren : true,
    // Ensure we pass undefined instead of an empty [] so it evaluates to falsy
    children: hasChildren ? children : undefined,
  };
};

const buildHeaderMenu = (baseMenu = [], apiMenu = []) => {
  const staticMenuItems = Array.isArray(baseMenu) ? baseMenu : [];
  const staticMenuByTitle = new Map(
    staticMenuItems.map((item) => [item?.title, item])
  );

  const staticMenus = STATIC_TOP_LEVEL_TITLES.map((title) =>
    staticMenuByTitle.get(title)
  ).filter(Boolean);

  const dynamicMenuByTitle = new Map(
    (Array.isArray(apiMenu) ? apiMenu : [])
      .map(normalizeDynamicMenuItem)
      .filter(Boolean)
      .map((item) => [item.title, item])
  );

  const dynamicMenus = API_TOP_LEVEL_TITLES.map((title) => {
    const dynamicItem = dynamicMenuByTitle.get(title);

    // Because Blogs no longer has children, we need to bypass the strict length check below
    if (title === 'Blogs' && dynamicItem) {
      return dynamicItem;
    }

    if (Array.isArray(dynamicItem?.children) && dynamicItem.children.length > 0) {
      return dynamicItem;
    }

    if (!STATIC_FALLBACK_TITLES.includes(title)) {
      return null;
    }

    const staticFallback = staticMenuByTitle.get(title);
    return Array.isArray(staticFallback?.children) &&
      staticFallback.children.length > 0
      ? staticFallback
      : null;
  }).filter(Boolean);

  // Added STATIC_NEW_MENUS so that PrimaryNavBar has the objects available to map
  return [...staticMenus, ...dynamicMenus, ...STATIC_TRAILING_MENUS, ...STATIC_NEW_MENUS];
};

export const useHeaderMenu = (options = {}) => {
  const query = useQuery({
    queryKey: ['header-menu'],
    queryFn: fetchHeaders,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return {
    ...query,
    menus: buildHeaderMenu(staticHeaderMenu, query.data?.data),
    topBar: query.data?.topBar || [],
    isError: query.isError || query.data?.success === false,
    errorMessage: query.error?.message || query.data?.message || '',
  };
};