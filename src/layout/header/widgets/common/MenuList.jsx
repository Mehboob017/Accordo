import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Col, Row } from 'reactstrap';
import MenuSlider from './MenuSlider';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

const getPathnameOnly = (path) => {
  if (!path || typeof path !== 'string') return '';
  return path.split('?')[0].split('#')[0];
};

const buildMenuHref = (path, params) => {
  if (!path || typeof path !== 'string') {
    return '#';
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!params) {
    return normalizedPath;
  }

  return {
    pathname: normalizedPath,
    query: params,
  };
};

const resolveHref = (href) => {
  if (!href) {
    return '#';
  }

  if (typeof href === 'string') {
    return href;
  }

  const pathname = typeof href.pathname === 'string' ? href.pathname : '';
  const query = href.query && typeof href.query === 'object' ? href.query : {};
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

const getLinkColumns = (menu) => {
  if (!Array.isArray(menu?.children)) {
    return [];
  }

  const hasColumnShape = menu.children.some((child) =>
    Array.isArray(child?.column)
  );

  if (hasColumnShape) {
    return menu.children;
  }

  const itemsPerColumn = menu?.title === 'Shop by Herbs' ? 6 : 6;
  const columns = [];

  for (let index = 0; index < menu.children.length; index += itemsPerColumn) {
    columns.push({
      column: menu.children.slice(index, index + itemsPerColumn),
    });
  }

  return columns;
};

const MENU_TITLES_WITH_CHILD_THUMBS = [
  'Shop by Herbs',
  'Shop by Health Concerns',
];

const MENU_TITLES_WITH_THUMB_GRID = ['Shop by Health Concerns'];

const SHOP_BY_CATEGORY_TITLE = 'Shop by Category';

const resolveMenuItemImage = (item) => {
  const candidate =
    item?.img ?? null;

  if (!candidate) {
    return '';
  }

  return getOptimizedCdnImageUrl(candidate, 60, 60, 80);
};

const MenuList = ({
  menu,
  customClass,
  anchorClass,
  isOpen,
  setIsOpen,
  level,
}) => {
  const { setMobileSideBar } = useContext(ThemeOptionContext);
  const pathname = usePathname() || '';
  const linkColumns = getLinkColumns(menu);
  const showChildThumbs = MENU_TITLES_WITH_CHILD_THUMBS.includes(menu?.title);
  const useThumbGridLayout = MENU_TITLES_WITH_THUMB_GRID.includes(menu?.title);
  const defaultAnchorClass = menu?.children
    ? 'nav-link dropdown-toggle'
    : 'nav-link';

  const normalizePath = (p) => {
    if (!p || typeof p !== 'string') return '';
    if (p === '#') return '';
    const basePath = getPathnameOnly(p);
    return basePath.startsWith('/') ? basePath : `/${basePath}`;
  };

  const isPathActive = (targetPath) => {
    const target = normalizePath(targetPath);
    if (!target) return false;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  const collectChildPaths = (node) => {
    if (!node) return [];

    // "link" mega-menu (Shop/Blogs) uses columns.
    if (node?.styleType === 'link' && Array.isArray(linkColumns)) {
      return getLinkColumns(node).flatMap((col) =>
        Array.isArray(col?.column)
          ? col.column
            .filter((h) => h?.type === 'link' && h?.path)
            .map((h) => normalizePath(h.path))
            .filter(Boolean)
          : []
      );
    }

    // "image" menu uses direct children with `path`.
    if (node?.styleType === 'image' && Array.isArray(node?.children)) {
      return node.children.map((c) => normalizePath(c?.path)).filter(Boolean);
    }

    // Simple dropdowns: { title, type, path, children }
    if (Array.isArray(node?.children)) {
      return node.children.flatMap((c) => [
        normalizePath(c?.path),
        ...collectChildPaths(c),
      ]);
    }

    return [];
  };


  useEffect(() => {
    setIsOpen([]);
  }, [pathname, setIsOpen]);

  const handleCloseSidebar = () => {
    if (setMobileSideBar) {
      setMobileSideBar(false);
    }
  };

  const closeMenus = () => {
    setIsOpen([]);
    handleCloseSidebar();
  };

  const handleReloadNavigation = (event, href) => {
    const resolvedHref = resolveHref(href);

    if (!resolvedHref || resolvedHref === '#') {
      closeMenus();
      return;
    }

    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (typeof event.button === 'number' && event.button !== 0);

    if (isModifiedClick) {
      closeMenus();
      return;
    }

    event.preventDefault();
    closeMenus();

    if (typeof window !== 'undefined') {
      window.location.assign(resolvedHref);
    }
  };

  const renderDropdownLinkItem = (head, itemKey) => {
    const childThumb = showChildThumbs ? resolveMenuItemImage(head) : '';
    const isAccentHeading =
      menu?.title === 'About Us' && head?.accent === 'heading';

    if (head?.type == 'sub' || isAccentHeading) {
      return (
        <span
          key={itemKey}
          className={`dropdown-header fw-bold text-dark fs-6 ${head?.colHeadClass ?? ''}`}
        >
          {head?.title}
        </span>
      );
    }

    if (head?.type == 'external_link') {
      return (
        <Link
          prefetch={false}
          key={itemKey}
          className={`dropdown-item text-wrap ${childThumb ? 'd-flex align-items-center' : ''}`}
          href={head?.path}
          target="_blank"
          onClick={closeMenus}
        >
          {childThumb ? (
            <>
              <img
                src={childThumb}
                alt={head?.title || 'Menu image'}
                width={30}
                height={30}
                loading="lazy"
                decoding="async"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  marginRight: '10px',
                  flexShrink: 0,
                }}
              />
              <span>{head?.title}</span>
            </>
          ) : (
            head?.title
          )}
          {head?.label && (
            <label className={`menu-label ${head?.labelClass ?? ''}`}>
              {head?.label}
            </label>
          )}
        </Link>
      );
    }

    return (
      <Link
        prefetch={false}
        key={itemKey}
        className={`dropdown-item text-wrap text-wrap-2 ${head?.accent ? 'fw-bold text-dark fs-6' : ''} ${childThumb ? 'd-flex align-items-center' : ''}`}
        href={buildMenuHref(head?.path, head?.params)}
        onClick={(event) =>
          handleReloadNavigation(
            event,
            buildMenuHref(head?.path, head?.params)
          )
        }
      >
        {childThumb ? (
          <>
            <img
              src={childThumb}
              alt={head?.title || 'Menu image'}
              width={30}
              height={30}
              loading="lazy"
              decoding="async"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                objectFit: 'cover',
                marginRight: '10px',
                flexShrink: 0,
              }}
            />
            <span>{head?.title}</span>
          </>
        ) : (
          head?.title
        )}
        {head?.label && (
          <label className={`menu-label ${head?.labelClass ?? ''}`}>
            {head?.label}
          </label>
        )}
      </Link>
    );
  };

  return (
    <>
      <li
        className={`${customClass ? customClass : ''} ${menu?.badge ? 'new-nav-item' : ''} ${menu.children ? 'dropdown-mega' : ''}`}
      >
        {menu?.path ? (
          <Link
            prefetch={false}
            className={`${anchorClass ? anchorClass : defaultAnchorClass}`}
            href={menu?.path}
            onClick={(event) => handleReloadNavigation(event, menu?.path)}
          >
            {menu?.title}
          </Link>
        ) : (
          <>
            <button
              type="button"
              className={`${anchorClass ? anchorClass : defaultAnchorClass}`}
              onClick={(e) => {
                e.preventDefault();
                const temp = isOpen.slice();
                temp[level] = menu.title !== temp[level] && menu.title;
                setIsOpen(temp);
              }}
            >
              {menu?.title}
              {menu?.badge && (
                <label className="new-dropdown">{menu?.badge}</label>
              )}
            </button>
          </>
        )}

        {menu?.styleType == 'image' && (
          <div
            className={`dropdown-menu dropdown-menu-2 dropdown-image ${!isOpen.length ? 'show' : isOpen[level] === menu.title ? 'show' : ''}`}
          >
            <div className="dropdown-column">
              {menu?.children?.map((data, i) => (
                <Link
                  prefetch={false}
                  className={`dropdown-item ${isPathActive(data?.path) ? 'active' : ''}`}
                  href={buildMenuHref(data?.path, data?.params)}
                  key={i}
                  onClick={(event) =>
                    handleReloadNavigation(
                      event,
                      buildMenuHref(data?.path, data?.params)
                    )
                  }
                >
                  <Image
                    src={data.image}
                    className="img-fluid"
                    alt={data.image}
                    height={100}
                    width={100}
                    unoptimized
                  />
                  <span>{data?.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {menu?.styleType == 'link' && menu?.title === SHOP_BY_CATEGORY_TITLE && (
          <div
            className={`dropdown-menu dropdown-menu-2 dropdown-shop-by-category ${isOpen[level] === menu.title ? 'show' : ''}`}
          >
            <Row>
              {linkColumns.map((elem, i) => (
                <Col
                  xl={linkColumns.length >= 4 ? 3 : 12 / linkColumns.length}
                  className="dropdown-column"
                  key={i}
                >
                  {elem?.column?.map((item, j) => (
                    <Link
                      prefetch={false}
                      key={j}
                      className={`shop-by-category-item ${isPathActive(item?.path) ? 'active' : ''}`}
                      href={buildMenuHref(item?.path, item?.params)}
                      onClick={(event) =>
                        handleReloadNavigation(
                          event,
                          buildMenuHref(item?.path, item?.params)
                        )
                      }
                    >
                      <div className="shop-by-category-title">{item?.title}</div>
                      {item?.subtitle ? (
                        <p className="shop-by-category-subtitle">
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item?.image ? (
                        <div className="shop-by-category-image-wrap">
                          <img
                            src={getOptimizedCdnImageUrl(item.image, 350, 170, 80)}
                            alt={item?.imageAlt || item?.title || 'Category'}
                            width={350}
                            height={170}
                            loading="lazy"
                            decoding="async"
                            className="img-fluid shop-by-category-image"
                          />
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </Col>
              ))}
            </Row>
          </div>
        )}

        {menu?.styleType == 'link' && menu?.title !== SHOP_BY_CATEGORY_TITLE && (
          <div
            className={`dropdown-menu dropdown-menu-2 ${useThumbGridLayout ? 'dropdown-thumbs-grid' : ''} ${isOpen[level] === menu.title ? 'show' : ''}`}
          >
            <Row>
              <>
                {useThumbGridLayout
                  ? menu?.children?.map((head, i) => (
                    <Col xl={3} lg={4} sm={6} className="dropdown-column" key={i}>
                      {renderDropdownLinkItem(head, i)}
                    </Col>
                  ))
                  : linkColumns.map((elem, i) => (
                    <Col
                      xl={
                        menu?.slider === 'blog'
                          ? 6
                          : linkColumns.length >= 4
                            ? 3
                            : linkColumns.length === 2
                              ? 6
                              : 4
                      }
                      className="dropdown-column"
                      key={i}
                    >
                      {elem?.column?.map((head, j) =>
                        renderDropdownLinkItem(head, j)
                      )}
                    </Col>
                  ))}
              </>
              <MenuSlider menu={menu} />
            </Row>
          </div>
        )}
        {menu?.children && !menu?.customChildren && (
          <ul
            className={`dropdown-menu ${isOpen[level] === menu.title ? 'show' : ''}`}
          >
            {menu.children && (
              <>
                {menu.children.map((childMenu, i) => (
                  <MenuList
                    menu={childMenu}
                    key={i}
                    anchorClass={'dropdown-item'}
                    level={level + 1}
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                  />
                ))}
              </>
            )}
          </ul>
        )}
      </li>
    </>
  );
};

export default MenuList;
