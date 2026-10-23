import Image from 'next/image';
import { useContext } from 'react';
import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import ProductIdsContext from '@/helper/productIdsContext';
// import BlogContext from '@/helper/blogContext';
import bannerImage from '../../../../../public/assets/images/mega-menu.png';
import banner2Image from '../../../../../public/assets/images/mega-menu2.png';
import ProductContext from '@/helper/productContext';

// const formatDuration = (value) => {
//   if (value == null || value === '') return '';

//   if (typeof value === 'string') {
//     const trimmed = value.trim();
//     if (!trimmed) return '';
//     if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;
//   }

//   const asNumber = Number(value);
//   if (!Number.isFinite(asNumber) || asNumber <= 0) return '';

//   const totalSeconds = Math.floor(asNumber);
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   if (hours > 0) {
//     return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//   }
//   return `${minutes}:${String(seconds).padStart(2, '0')}`;
// };

// const extractCategorySlugFromPath = (path) => {
//   if (!path || typeof path !== 'string') return '';
//   // Expected: "/blogs/<category-slug>"
//   const cleaned = path.split('?')[0].split('#')[0];
//   const parts = cleaned.split('/').filter(Boolean);
//   if (parts[0] !== 'blogs') return '';
//   return parts[1] || '';
// };

const MenuSlider = ({ menu }) => {
  const { filteredProduct } = useContext(ProductIdsContext);
  const { productAPIData } = useContext(ProductContext);
  // const { blogState } = useContext(BlogContext);
  return (
    <>
      {menu?.slider === 'product' && (
        <Col xl={6} className="dropdown-column d-xl-block d-none">
          <div className="menu-product-slider">
            <Row>
              {(filteredProduct?.length > 0
                ? filteredProduct
                : productAPIData?.data
              )
                ?.slice(0, 2)
                ?.map((product, i) => (
                  <Col xs={6} key={i}>
                    <ProductBox1
                      imgUrl={product?.product_thumbnail}
                      productDetail={{ ...product }}
                    />
                  </Col>
                ))}
            </Row>
          </div>
        </Col>
      )}
      {menu.slider === 'banner' && (
        <Col xl={3} className="dropdown-column d-xl-block d-none">
          <div className="menu-img-banner">
            <Link
              href={`/products/deliciously-sweet-watermelon`}
              className="text-title"
            >
              <Image
                src={bannerImage}
                alt="banner"
                className="img-fluid"
                height={511}
                width={270}
              />
            </Link>
          </div>
        </Col>
      )}
      {menu.slider === 'banner_landscape' && (
        <Col xl={12} className="dropdown-column d-xl-block d-none">
          <div className="menu-img-banner rounded overflow-hidden mx-0 mt-3 mb-0">
            <Image
              src={banner2Image}
              alt="banner_landscape"
              className="img-fluid"
              height={190}
              width={954}
            />
          </div>
        </Col>
      )}
      {/* {menu?.slider === 'blog' && (
        <Col xl={6} className="dropdown-column d-xl-block d-none">
          <Row>
            {(() => {
              const apiLatest = menu?.latestBlog;
              const source = apiLatest?.slug ? [apiLatest] : blogState?.slice(0, 1) || [];

              const apiCategorySlug = extractCategorySlugFromPath(
                menu?.blogCategories?.[0]?.path
              );

              return source.map((blog, i) => {
                const isApiLatest = blog === apiLatest;
                const apiLatestCategorySlug =
                  blog?.blogCategory?.slug || apiCategorySlug;
                const catSlug = isApiLatest
                  ? apiLatestCategorySlug
                  : blog?.categories?.[0]?.slug || '';
                const categoryName = isApiLatest
                  ? blog?.blogCategory?.name || menu?.blogCategories?.[0]?.name || ''
                  : blog?.categories?.[0]?.name || '';
                const blogHref = catSlug
                  ? `/blogs/${catSlug}/${blog?.slug}`
                  : `/blogs/${blog?.slug}`;
                const categoryHref = catSlug ? `/blogs/${catSlug}` : '/blogs';

                const blogImage = isApiLatest
                  ? blog?.coverImage || placeHolderImage
                  : blog?.blog_thumbnail?.original_url
                    ? blog.blog_thumbnail.original_url
                    : placeHolderImage;

                const blogDate = blog?.date || blog?.created_at;
                const durationLabel =
                  formatDuration(
                    blog?.duration ||
                    blog?.video_duration ||
                    blog?.videoDuration ||
                    blog?.media_duration ||
                    blog?.mediaDuration
                  ) || STATIC_DURATION_FALLBACK;
                const viewsRaw =
                  blog?.view_count ??
                  blog?.viewCount ??
                  blog?.views ??
                  blog?.total_views ??
                  blog?.totalViews ??
                  null;
                const views = formatReviewCount(
                  viewsRaw == null || Number.isNaN(Number(viewsRaw))
                    ? STATIC_VIEWS_FALLBACK
                    : Number(viewsRaw)
                );

                return (
                  <Col xs={12} key={i}>
                    <div className="blog-box sticky-blog feature-blog-card">
                      <div className="blog-box-image position-relative">
                        <BlogBookmarkButton
                          blog={blog}
                          className="feature-blog-bookmark"
                          style={{ top: '16px', right: '16px' }}
                        />

                        <Link href={blogHref} className="blog-image">
                          <Image
                            src={blogImage}
                            className="img-fluid"
                            alt={blog.title}
                            height={299}
                            width={398}
                            unoptimized
                          />
                        </Link>

                        <div className="feature-blog-duration">
                          <span>{durationLabel}</span>
                        </div>
                      </div>

                      <div className="blog-detail feature-blog-detail">
                        <Link href={blogHref} className="feature-blog-title-link">
                          <h5>{blog?.title}</h5>
                        </Link>

                        <div className="feature-blog-meta-row">
                          <div className="feature-blog-meta-left">
                            {!!categoryName && (
                              <Link href={categoryHref} className="feature-blog-category">
                                {categoryName}
                              </Link>
                            )}
                            {views != null && (
                              <span className="feature-blog-views">
                                <RiEyeLine />
                                {views}
                              </span>
                            )}
                          </div>

                          <Link
                            href={blogHref}
                            className="feature-blog-arrow"
                            aria-label="Open blog"
                            title="Open blog"
                          >
                            <RiArrowRightUpLine />
                          </Link>
                        </div>

                        <span className="visually-hidden">{dateFormat(blogDate)}</span>
                      </div>
                    </div>
                  </Col>
                );
              });
            })()}
          </Row>
        </Col>
      )} */}
    </>
  );
};

export default MenuSlider;
