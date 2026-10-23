'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSDLPublications } from '@/utils/hooks/useSDLPublications';
import { hasValidToken } from '@/api/sdl-publication.api';
import { formatDate } from '@/utils/helpers';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { useUser } from '@/utils/hooks/useUser';
import { RiArrowRightCircleLine, RiArrowRightSLine, RiCalendarLine, RiFileList3Line, RiShieldUserLine } from 'react-icons/ri';

export default function SDLPublicationsClient() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [otpModal, setOtpModal] = useState(false);
  const categoryRefs = useRef({});
  const DESCRIPTION_CHAR_LIMIT = 299;

  // Get user authentication state
  const { userData, isAuthenticated } = useUser();

  // Check if user is a doctor
  const isDoctor = userData?.isDoctor || userData?.role === 'Doctor';
  const canAccessPublications = isAuthenticated && isDoctor && hasValidToken();

  // Fetch SDL Publications using React Query
  const { data, isLoading, isError, error } = useSDLPublications({
    enabled: canAccessPublications, // Only fetch when authenticated doctor with token
  });

  const categoriesData = data?.categories || [];
  const publicationsData = data?.publications || [];
  const customerInfo = data?.customerInfo;

  // Set first category as active when data loads
  useEffect(() => {
    if (categoriesData.length > 0 && !activeCategory) {
      setActiveCategory(categoriesData[0].uid);
    }
  }, [categoriesData, activeCategory]);

  const truncateText = (text, limit) => {
    if (!text || text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };
  const itemsPerPage = 8;

  const handleLogin = () => {
    setOtpModal(true);
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

  const getPublicationsByCategory = (categoryUid) => {
    return publicationsData.filter(
      (pub) => pub.resourceCategoryUid === categoryUid
    );
  };

  // Show login prompt if not authenticated or not a doctor
  if (!isAuthenticated || !isDoctor || isError) {
    return (
      <>
        <section className="practitioner-access-section section-t-space section-b-space">
          <div className="">
            <div className="access-notice-wrapper">
              <div className="access-notice-card">
                <div className="access-notice-icon">
                  {/* <i className="ri-shield-user-line"></i> */}
                  <RiShieldUserLine />
                  <div className="access-notice-header">
                    <h1 className="access-notice-title">
                      Practitioner Access Required
                    </h1>
                  </div>
                </div>

                <div className="access-notice-content">
                  <div className="disclaimer-box">
                    <p className="disclaimer-text">
                      <span className="disclaimer-label">
                        <strong>Disclaimer:</strong>
                      </span>{' '}
                      The information provided on this page is intended solely
                      for <strong>Registered Ayurved Practitioners</strong>. It
                      is not meant for general public use or for individuals
                      without formal Ayurved qualifications. Please proceed only
                      if you are an authorized practitioner.
                    </p>
                  </div>

                  <div className="access-instruction">
                    <p className="instruction-text">
                      To access the Publications section, please use your{' '}
                      <strong>Vaidya Login</strong>.
                    </p>
                  </div>
                </div>

                <div className="access-notice-action">
                  <button
                    onClick={handleLogin}
                    className="btn access-login-btn btn-primary"
                  >
                    {/* <i className="ri-arrow-right-circle-line"></i> */}
                    <RiArrowRightCircleLine />
                    Go to Vaidya Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Login Modal */}
        <OtpLoginModal isOpen={otpModal} setOpen={setOtpModal} />
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="publications-section section-t-space section-b-space">
        <div className="">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading SDL Publications...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  // if (isError) {
  //   return (
  //     <section className="publications-section section-t-space section-b-space">
  //       <div className="">
  //         <div className="access-notice-wrapper">
  //           <div className="access-notice-card">
  //             <div className="access-notice-icon">
  //               <i className="ri-error-warning-line text-danger"></i>
  //               <div className="access-notice-header">
  //                 <h1 className="access-notice-title text-danger">Error Loading Publications</h1>
  //               </div>
  //             </div>

  //             <div className="access-notice-content">
  //               <div className="disclaimer-box">
  //                 <p className="disclaimer-text">
  //                   {error?.message || 'Failed to load SDL publications. Please try again.'}
  //                 </p>
  //               </div>
  //             </div>

  //             <div className="access-notice-action">
  //               <button
  //                 onClick={() => window.location.reload()}
  //                 className="btn access-login-btn"
  //               >
  //                 <i className="ri-refresh-line"></i>
  //                 Retry
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }

  // No data state
  if (!categoriesData.length) {
    return (
      <section className="publications-section section-t-space section-b-space">
        <div className="">
          <div className="text-center py-5">
            {/* <i
              className="ri-file-list-3-line"
              style={{ fontSize: '4rem', opacity: 0.3 }}
            ></i> */}
            <RiFileList3Line style={{ fontSize: '4rem', opacity: 0.3 }} />
            <p className="mt-3">No publications available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="publications-section section-t-space section-b-space">
      <div className="">
        {/* Categories Navigation */}
        <div className="categories-navigation-wrapper">
          <div className="categories-scroll-container">
            {categoriesData.map((category) => (
              <div
                key={category.uid}
                className={`category-item ${activeCategory === category.uid ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.uid)}
              >
                <div className="category-image-wrapper">
                  <Image
                    src={category?.image || '/assets/images/logo/1.png'}
                    alt={category?.imageAlt || category?.name}
                    width={80}
                    height={80}
                    className="category-image"
                    onError={(e) => {
                      e.target.src = '/assets/images/logo/1.png';
                    }}
                  />
                </div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications Content */}
        <div className="publications-content">
          {categoriesData.map((category) => {
            const publications = getPublicationsByCategory(category.uid);
            if (publications.length === 0) return null;

            return (
              <div
                key={category.uid}
                id={category.uid}
                ref={(el) => (categoryRefs.current[category.uid] = el)}
                className="category-section"
              >
                <h2 className="category-section-title">{category.name}</h2>
                {category.description && (
                  <div className="category-description-wrapper">
                    <p className="category-description">
                      {expandedCategories[category.uid] &&
                        expandedCategories[category.uid]
                        ? category.description
                        : truncateText(
                          category.description,
                          DESCRIPTION_CHAR_LIMIT
                        )}
                    </p>
                    {category.description.length > DESCRIPTION_CHAR_LIMIT && (
                      <button
                        className="read-more-link"
                        onClick={() => toggleCategoryReadMore(category.uid)}
                      >
                        {expandedCategories[category.uid]
                          ? 'Read Less'
                          : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                <div className="publications-grid">
                  {publications.map((publication) => {
                    return (
                      <a
                        key={publication.uid}
                        href={publication.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={publication.uid}
                        className="publication-card-link"
                      >
                        <div className="publication-card">
                          <div className="publication-card-inner">
                            <div className="publication-image">
                              <div className="pdf-badge">
                                <span>PDF</span>
                              </div>
                              <Image
                                src={
                                  publication.coverImage ||
                                  '/assets/images/logo/1.png'
                                }
                                alt={
                                  publication.coverImageAlt || publication.title
                                }
                                width={300}
                                height={200}
                                className="img-fluid"
                                onError={(e) => {
                                  e.target.src = '/assets/images/logo/1.png';
                                }}
                              />
                            </div>
                            <div className="publication-content">
                              <h3
                                className="publication-title"
                                title={publication.title}
                              >
                                {publication.title}
                              </h3>
                              <div className="publication-meta">
                                <span className="publication-date">
                                  {/* <i className="ri-calendar-line"></i> */}
                                  <RiCalendarLine />
                                  {formatDate(publication.date)}
                                </span>
                              </div>
                            </div>
                            <div className="publication-meta">
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
                    );
                  })}
                </div>

                {publications.length > itemsPerPage && (
                  <nav className="custome-pagination mt-4">
                    <Pagination
                      total={publications.length}
                      perPage={itemsPerPage}
                    />
                  </nav>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
