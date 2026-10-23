'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiCloseLine } from 'react-icons/ri';
import CategoryContext from '@/helper/categoryContext';
import CommonSearchBar from '@/components/common/CommonSearchBar';
import Avatar from '@/components/common/Avatar';
import { placeHolderImage } from '@/data/CommonPath';
import styles from './MobileCategoryBrowser.module.scss';

const MobileCategoryBrowser = ({ isOpen, onClose }) => {
  const { filterCategory, categoryIsLoading } = useContext(CategoryContext);
  const categoryData = filterCategory('product');
  const router = useRouter();

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const DUMMY_TILE_IMAGE = placeHolderImage;

  const categoryListRef = useRef(null);
  const subcategoryListRef = useRef(null);
  const activeCategoryRef = useRef(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setActiveCategoryIndex(0);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Scroll active category into view
  useEffect(() => {
    if (activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeCategoryIndex]);

  // Reset subcategory scroll when category changes
  useEffect(() => {
    if (subcategoryListRef.current) {
      subcategoryListRef.current.scrollTop = 0;
    }
  }, [activeCategoryIndex]);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!categoryData) return [];
    if (!searchQuery.trim()) return categoryData;

    const q = searchQuery.toLowerCase().trim();
    return categoryData.filter((cat) => {
      if (cat.name?.toLowerCase().includes(q)) return true;
      // Also match if any subcategory matches
      return cat.subcategories?.some((sub) =>
        sub.name?.toLowerCase().includes(q)
      );
    });
  }, [categoryData, searchQuery]);

  // Active category's subcategories
  const activeCategory = filteredCategories[activeCategoryIndex] || null;

  const filteredSubcategories = useMemo(() => {
    if (!activeCategory?.subcategories) return [];
    if (!searchQuery.trim()) return activeCategory.subcategories;

    const q = searchQuery.toLowerCase().trim();
    // If parent matched by name, show all subcategories
    if (activeCategory.name?.toLowerCase().includes(q)) {
      return activeCategory.subcategories;
    }
    // Otherwise filter subcategories
    return activeCategory.subcategories.filter((sub) =>
      sub.name?.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  // When search changes and active index is out of bounds, reset it
  useEffect(() => {
    if (activeCategoryIndex >= filteredCategories.length) {
      setActiveCategoryIndex(0);
    }
  }, [filteredCategories.length]);

  const handleCategoryClick = (index) => {
    setActiveCategoryIndex(index);
  };

  const handleSubcategoryClick = (subcategory) => {
    onClose();
    router.push(`/collections?category=${subcategory.slug}`);
  };

  const handleCategoryNavigate = (category) => {
    onClose();
    router.push(`/collections?category=${category.slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Shop by Category</h2>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close category browser"
        >
          <RiCloseLine />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <CommonSearchBar
          onSearch={(query) => setSearchQuery(query)}
          placeholderWords={['categories', 'products', 'ayurvedic']}
          storageKey="category_browser_searches"
          searchLabel="Search categories"
          autoSearch={true}
          className="mobile-category-search mb-0"
        />
      </div>

      {/* Two-column body */}
      <div className={styles.body}>
        {/* Left: Categories */}
        <div className={styles.categoriesCol} ref={categoryListRef}>
          {categoryIsLoading ? (
            <div className={styles.emptyCategories}>Loading...</div>
          ) : filteredCategories.length === 0 ? (
            <div className={styles.emptyCategories}>No categories found</div>
          ) : (
            filteredCategories.map((cat, index) => (
              <div
                key={cat.id || cat.slug || index}
                ref={index === activeCategoryIndex ? activeCategoryRef : null}
                className={`${styles.categoryItem} ${index === activeCategoryIndex ? styles.categoryItemActive : ''}`}
                onClick={() => handleCategoryClick(index)}
              >
                <Avatar
                  data={DUMMY_TILE_IMAGE}
                  placeHolder={placeHolderImage}
                  name={cat.name}
                  customClass={styles.categoryIcon}
                  height={44}
                  width={44}
                />
                <span className={styles.categoryName}>{cat.name}</span>
              </div>
            ))
          )}
        </div>

        {/* Right: Subcategories */}
        <div className={styles.subcategoriesCol} ref={subcategoryListRef}>
          {activeCategory && (
            <>
              <div
                className={styles.viewAllButton}
                onClick={() => handleCategoryNavigate(activeCategory)}
              >
                View All {activeCategory.name}
              </div>

              {filteredSubcategories.length > 0 ? (
                <div className={styles.subcategoryGrid}>
                  {filteredSubcategories.map((sub, i) => (
                    <div
                      key={sub.slug || i}
                      className={styles.subcategoryCard}
                      onClick={() => handleSubcategoryClick(sub)}
                    >
                      <Avatar
                        data={DUMMY_TILE_IMAGE}
                        placeHolder={placeHolderImage}
                        name={sub.name}
                        customClass={styles.subcategoryImage}
                        height={56}
                        width={56}
                      />
                      <span className={styles.subcategoryName}>{sub.name}</span>
                      {sub.products_count != null && (
                        <span className={styles.subcategoryCount}>
                          {sub.products_count} items
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptySubcategories}>
                  No subcategories found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCategoryBrowser;
