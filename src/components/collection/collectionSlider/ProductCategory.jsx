'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaBuilding, FaThLarge } from 'react-icons/fa';
import styles from './ProductCategory.module.scss';
import { useDepartments } from '@/utils/hooks/useDepartments';
import { updateSearchParamsWithFilters } from '../filterUtils';

const ProductCategory = ({ filter, setFilter }) => {
  const router = useRouter();
  const pathname = usePathname();
  // Ensure we are utilizing the existing searchParams so we don't drop other filters
  // const searchParams = useSearchParams();
  const { departments, isLoading } = useDepartments();

  const categoryItems = useMemo(
    () => [
      { uid: 'all', name: 'All', slug: '', icon: <FaThLarge /> },
      ...departments.map((department) => ({
        ...department,
        icon: <FaBuilding />,
      })),
    ],
    [departments]
  );

  const activeDepartment = filter?.department || '';

  const handleDepartmentSelect = useCallback(
    (departmentSlug) => {
      const nextFilter = {
        department: departmentSlug,
      };

      // If your parent component reads from the URL, remove setFilter entirely.
      // If it relies on local state, keep it, but be aware it triggers a render.
      if (setFilter) {
        setFilter(nextFilter);
      }

      // // Merge with existing search params instead of starting fresh (optional, but recommended)
      // const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
      // const nextSearchParams = updateSearchParamsWithFilters(
      //   currentParams,
      //   nextFilter
      // );

      const nextSearchParams = new URLSearchParams();

      if (departmentSlug) {
        nextSearchParams.set('department', departmentSlug);
      }

      router.push(
        nextSearchParams.toString()
          ? `${pathname}?${nextSearchParams.toString()}`
          : pathname,
        { scroll: false }
      );

      const queryString = nextSearchParams.toString();

      // IMPORTANT: Add { scroll: false } so Next.js doesn't trigger a hard navigation evaluation
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, setFilter]
  );

  if (isLoading) {
    return (
      <div className="container-fluid-lg category-slider">
        <nav className={`${styles.categoryNav} hide-scrollbar`}>
          <ul className={styles.categoryList}>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <div
                  className={styles.categoryItem}
                  style={{ width: 90, height: 100, borderRadius: 8, background: 'var(--border-color)', opacity: 0.5, animation: 'none' }}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className="container-fluid-lg category-slider" translate='no'>
      <nav
        className={`${styles.categoryNav} hide-scrollbar`}
        data-lenis-prevent
      >
        <ul className={styles.categoryList}>
          {categoryItems.map((category) => {
            const isActive = (category.slug || '') === activeDepartment;

            return (
              <li key={category.uid}>
                <button
                  type="button"
                  className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
                  onClick={() => handleDepartmentSelect(category.slug)}
                  disabled={category.disabled}
                >
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default ProductCategory;