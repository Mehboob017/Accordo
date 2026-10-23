'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { usePreclinicalStudies } from '@/utils/hooks/usePreclinicalStudies';
import { formatDate } from '@/utils/helpers';
import PreclinicalStudiesSkeleton from './PreclinicalStudiesSkeleton';
import { RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';

export default function PreclinicalStudiesClient() {
  const { data: response, isLoading } = usePreclinicalStudies();

  const categoryRefs = useRef({});
  const subcategoryRefs = useRef({});
  const DESCRIPTION_CHAR_LIMIT = 299;

  // Transform API data to component format
  const resourceCategories = response?.data?.resourcecategories || [];
  const preClinicalStudies = response?.data?.peclinicalstudies || [];

  const categories =
    resourceCategories.length > 0
      ? resourceCategories.map((cat) => ({
        id: cat.uid,
        name: cat.name,
        image: cat.image,
        description: cat.description || '',
      }))
      : [];

  // Extract unique subcategories from studies
  const subcategories =
    preClinicalStudies.length > 0
      ? preClinicalStudies.reduce((acc, study) => {
        const existing = acc.find(
          (sub) => sub.id === study.resourceSubcategoryUid
        );
        if (!existing && study.resourceSubcategory) {
          acc.push({
            id: study.resourceSubcategoryUid,
            categoryId: study.resourceCategoryUid,
            name: study.resourceSubcategory.name,
          });
        }
        return acc;
      }, [])
      : [];

  // Transform studies
  const studies =
    preClinicalStudies.length > 0
      ? preClinicalStudies.map((study) => ({
        id: study.uid,
        subcategoryId: study.resourceSubcategoryUid,
        title: study.title,
        // date: study.date || study.created_at?.split('T')[0],
        date: study.date || null,
        pdfUrl: study.pdfPath,
        imageUrl: study.coverImage,
      }))
      : [];

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 1);
  const [expandedCategories, setExpandedCategories] = useState({});

  if (isLoading) return <PreclinicalStudiesSkeleton />;

  const truncateText = (text, limit) => {
    if (!text || text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleCategoryReadMore = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getSubcategoriesByCategory = (categoryId) => {
    return subcategories.filter((sub) => sub.categoryId === categoryId);
  };

  const getStudiesBySubcategory = (subcategoryId) => {
    return studies.filter((study) => study.subcategoryId === subcategoryId);
  };

  return (
    <section className="publications-section section-t-space section-b-space">
      <div className="">
        {/* Categories Navigation */}
        <div className="categories-navigation-wrapper">
          <div className="categories-scroll-container">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-image-wrapper">
                  <Image
                    src={category.image || '/assets/images/logo/1.png'}
                    alt={category.name || 'Category Image'}
                    width={80}
                    height={80}
                    className="category-image"
                    onError={(e) => {
                      e.target.src = '/assets/images/logo/1.png';
                      e.target.alt = 'Category Image';
                    }}
                  />
                </div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Content */}
        <div className="publications-content">
          {categories.map((category) => {
            const categorySubcategories = getSubcategoriesByCategory(
              category.id
            );
            if (categorySubcategories.length === 0) return null;

            return (
              <div
                id={category.id}
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
                className="category-section"
              >
                <h2 className="category-section-title">{category.name}</h2>
                {category.description && (
                  <div className="category-description-wrapper">
                    <p className="category-description">
                      {expandedCategories[category.id]
                        ? category.description
                        : truncateText(
                          category.description,
                          DESCRIPTION_CHAR_LIMIT
                        )}
                    </p>
                    {category.description.length > DESCRIPTION_CHAR_LIMIT && (
                      <button
                        className="read-more-link"
                        onClick={() => toggleCategoryReadMore(category.id)}
                      >
                        {expandedCategories[category.id]
                          ? 'Read Less'
                          : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                {/* Subcategories */}
                {categorySubcategories.map((subcategory) => {
                  const subcategoryStudies = getStudiesBySubcategory(
                    subcategory.id
                  );
                  if (subcategoryStudies.length === 0) return null;

                  return (
                    <div
                      key={subcategory.id}
                      ref={(el) =>
                        (subcategoryRefs.current[subcategory.id] = el)
                      }
                      className="subcategory-section"
                    >
                      <h3 className="subcategory-title">{subcategory.name}</h3>

                      <div className="publications-grid">
                        {subcategoryStudies.map((study) => (
                          <a
                            key={study.id}
                            id={study.id}
                            href={study.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="publication-card-link"
                          >
                            <div className="publication-card">
                              <div className="publication-card-inner">
                                <div className="publication-image">
                                  <div className="pdf-badge">
                                    <span>PDF</span>
                                  </div>
                                  <Image
                                    src={study.imageUrl}
                                    alt={study.title}
                                    width={300}
                                    height={200}
                                    className="img-fluid"
                                    onError={(e) => {
                                      e.target.src =
                                        '/assets/images/logo/1.png';
                                    }}
                                  />
                                </div>
                                <div className="publication-content">
                                  <h3
                                    className="publication-title"
                                    title={study.title}
                                  >
                                    {study.title}
                                  </h3>
                                  {study.date && (
                                    <div className="publication-meta">
                                      <span className="publication-date">
                                        {/* <i className="ri-calendar-line"></i> */}
                                        <RiCalendarLine />
                                        {formatDate(study.date)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="publication-meta m-0">
                                  {/* <span className="view-pdf-link d-inline-block m-2">
                                      View PDF
                                    </span> */}
                                  <button className="herb-card__button w-100 btn-primary">
                                    View PDF
                                    <RiArrowRightSLine className="button-icon" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
