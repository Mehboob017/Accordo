'use client';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Row } from 'reactstrap';
import Sidebar from '../sidebar/Sidebar';
import BlogCardDetails from '../BlogCardDetails';
import WrapperComponent from '@/components/common/WrapperComponent';
import RelatedProduct from '@/components/productDetails/common/RelatedProduct';
import FeatureBlog from '@/components/parisTheme/FeatureBlog';
import { latestBlogSlider } from '@/data/SliderSettings';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import { RiArticleLine, RiHome3Fill } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';
import { useBlog } from '@/utils/hooks/useBlog';
import SkSingleBlog from '@/components/common/skeletonLoader/blogSkeleton/SkSingleBlog';

const SingleBlog = ({ categorySlug, blogSlug }) => {
  const { data, isLoading, isError } = useBlog(blogSlug);
  const Blog = data?.blog;
  const blogProductsFromAPI = data?.products || [];
  const rawBlog = data?.raw?.data?.blog;
  const hasNoBlog = !isLoading && (isError || !Blog?.slug);
  // Show only API quantity: exclude current blog and dedupe by id
  const relatedBlogs = (data?.relatedBlogs || [])
    .filter((b) => b.slug !== blogSlug && b.id !== Blog?.id)
    .filter((b, i, arr) => arr.findIndex((x) => x.id === b.id) === i);

  const sliderRef = useRef(null);
  // Disable infinite so react-slick doesn't clone slides and repeat the same blogs; show 4 per row
  const blogSliderConfig = {
    ...latestBlogSlider,
    arrows: false,
    infinite: false,
    slidesToShow: 4,
    responsive: [
      // Keep 4 visible on typical laptops; drop to 3 below lg
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 876, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  const sidebarType = 'right_sidebar';

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [visibleSlides, setVisibleSlides] = useState(4);

  useEffect(() => {
    const getVisibleSlides = (width) => {
      if (width < 576) return 1;
      if (width < 876) return 2;
      if (width < 992) return 3;
      return 4;
    };

    const updateVisibleSlides = () => {
      setVisibleSlides(getVisibleSlides(window.innerWidth));
    };

    updateVisibleSlides();
    window.addEventListener('resize', updateVisibleSlides);
    return () => window.removeEventListener('resize', updateVisibleSlides);
  }, []);

  const shouldShowSliderNav = relatedBlogs.length > visibleSlides;

  const getYouTubeEmbedUrl = (videoId) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  if (isLoading) {
    return (
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space', row: 'g-4' }}
        customCol={true}
      >
        <SkSingleBlog sidebarType={sidebarType} />
        <Sidebar
          categorySlug={categorySlug}
          sidebarType={sidebarType}
          forceLoading
        />
      </WrapperComponent>
    );
  }
  // console.log("relatedBlogs", relatedBlogs);
  if (hasNoBlog) {
    return (
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space', row: 'g-4' }}
        customCol={true}
      >
        <div className="empty-cart-box my-5">
          <div className="empty-icon">
            <RiArticleLine />
          </div>
          <h5>You may not have permission to access this blog, or it may no longer be available.</h5>
          <a
            href={categorySlug ? `/blogs/${categorySlug}` : '/blogs'}
            className="btn btn-md theme-bg-color text-white mt-3 d-inline-block"
          >
            Back to Blogs
          </a>
        </div>
      </WrapperComponent>
    );
  }

  return (
    <>
      {/* <Breadcrumb
        title={Blog?.title}
        subNavigation={[
          { name: 'Blogs', link: '/blogs' },
          { name: Blog?.title },
        ]}
        bgImage="/assets/images/A7.webp"
      /> */}
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space', row: 'g-4' }}
        customCol={true}
      >
        <nav className="d-flex mt-2">
          <ol className="breadcrumb mb-0 d-flex">
            <li className="breadcrumb-item">
              <a href="/" aria-label="Home">
                <RiHome3Fill aria-hidden="true" />
              </a>
            </li>
            <li className="breadcrumb-item">
              <a href="/blogs">Blogs</a>
            </li>
            <li className="breadcrumb-item">
              <a
                href={
                  Blog?.categories?.[0]?.slug
                    ? `/blogs/${Blog.categories[0].slug}`
                    : '/blogs'
                }
                className="text-capitalize"
              >
                {Blog?.categories?.[0]?.name || 'Blog'}
              </a>
            </li>
            <li className="breadcrumb-item active text-capitalize">
              {Blog?.title}
            </li>
          </ol>
        </nav>
        <BlogCardDetails
          Blog={Blog}
          rawBlog={rawBlog}
          categorySlug={categorySlug}
          key={blogSlug}
          sidebarType={sidebarType}
          onVideoSelect={setSelectedVideo}
        />
        <Sidebar categorySlug={categorySlug} sidebarType={sidebarType} />
      </WrapperComponent>

      {selectedVideo?.videoId && (
        <div
          className="video-modal"
          onClick={() => setSelectedVideo(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setSelectedVideo(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fefefe',
                fontSize: '48px',
                cursor: 'pointer',
                width: '48px',
                height: '48px',
                lineHeight: '1',
                padding: '0',
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <div className="video-wrapper">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.videoId)}
                title={selectedVideo.title}
                // frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            </div>
          </div>
        </div>
      )}

      {/* Blog Slider Section - uses relatedBlogs/recentPosts from detail API */}
      {relatedBlogs.length > 0 && (
        <WrapperComponent
          classes={{ sectionClass: 'related-blogs-section section-lg-space' }}
          noRowCol
          translate="no"
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 title">
            <CustomHeading
              customClass="mb-0"
              title="Related Blogs"
              subTitle="Explore More Blogs"
              svgUrl={<LeafSVG className="icon-width" />}
            />
            <div className="d-none d-lg-flex">
              <a href={categorySlug ? `/blogs/${categorySlug}` : '/blogs'}>
                <Btn color="primary" size="md" className="">
                  View More
                </Btn>
              </a>
            </div>
          </div>
          <div className="hero-carousel-section mt-4 position-relative">
            <Row>
              <style>{`
                .left-align-slider .slick-track {
                  margin-left: 0 !important;
                }
              `}</style>
              <FeatureBlog
                classes={{
                  sliderClass: 'col-12 left-align-slider',
                  sliderOption: blogSliderConfig,
                }}
                sliderRef={sliderRef}
                blogs={relatedBlogs}
              />
            </Row>
            {/* Hero-style nav buttons, reusing slick classes for styling */}
            {shouldShowSliderNav && (
              <>
                <button
                  type="button"
                  className="slick-prev"
                  onClick={() => sliderRef.current?.slickPrev()}
                  aria-label="Previous"
                />
                <button
                  type="button"
                  className="slick-next"
                  onClick={() => sliderRef.current?.slickNext()}
                  aria-label="Next"
                />
              </>
            )}
          </div>
          <div className="d-flex d-lg-none justify-content-center mt-4">
            <a href={categorySlug ? `/blogs/${categorySlug}` : '/blogs'}>
              <Btn color="primary" size="md" className="">
                View More
              </Btn>
            </a>
          </div>
        </WrapperComponent>
      )}

      {blogProductsFromAPI.length > 0 && (
        <RelatedProduct productData={blogProductsFromAPI} />
      )}
    </>
  );
};

export default SingleBlog;
