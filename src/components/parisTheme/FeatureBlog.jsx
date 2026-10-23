import React, { useContext, useMemo } from 'react';
import Slider from 'react-slick';
import RatioImage from '@/utils/RatioImage';
import Link from 'next/link';
import { dateFormat } from '@/utils/customFunctions/DateFormat';
import BlogContext from '@/helper/blogContext';
import BlogBookmarkButton from '@/components/blogs/BlogBookmarkButton';
import { RiArrowRightUpLine, RiEyeLine } from 'react-icons/ri';
import { formatReviewCount, getOptimizedCdnImageUrl } from '@/utils/helpers';

const FeatureBlog = ({
  classes = {},
  dataAPI,
  blogs: blogsProp,
  sliderRef,
}) => {
  const { blogState } = useContext(BlogContext);

  const filterBlogs = useMemo(() => {
    if (blogsProp && blogsProp.length > 0) {
      return blogsProp;
    }
    if (dataAPI) {
      return blogState?.filter((el) => dataAPI?.blog_ids.includes(el.id)) || [];
    }
    return blogState || [];
  }, [blogState, dataAPI, blogsProp]);

  // When blogs come from props (e.g. relatedBlogs from API), show full API quantity; else limit to 5
  const sliderBlogs = useMemo(() => {
    if (!filterBlogs) return [];
    if (blogsProp?.length) return filterBlogs;
    return filterBlogs.slice(0, 5);
  }, [filterBlogs, blogsProp]);

  if (!sliderBlogs) return null;

  return (
    <div className={classes?.sliderClass ? classes?.sliderClass : ''}>
      <Slider ref={sliderRef} {...classes?.sliderOption}>
        {sliderBlogs?.map((elem, slideIdx) => {
          const catSlug =
            elem?.categories?.[0]?.slug || elem?.blogCategory?.slug || '';
          const categoryName =
            elem?.categories?.[0]?.name || elem?.blogCategory?.name || '';
          const blogHref = catSlug
            ? `/blogs/${catSlug}/${elem?.slug}`
            : `/blogs/${elem?.slug}`;
          const categoryHref = catSlug ? `/blogs/${catSlug}` : '/blogs';

          const viewsRaw = elem?.viewCount;
          const views = formatReviewCount(viewsRaw);

          return (
            <div key={elem.id} className="h-100 d-flex">
              <div
                className={`blog-box feature-blog-card h-100 ${classes?.ratioClass ? classes?.ratioClass : ''}`}
                aria-hidden={undefined}
              >
                {/* {elem?.is_featured ? (
                <div className="blog-label-tag">
                  <span>Featured</span>
                </div>
              ) : null} */}
                <div className="blog-box-image">
                  <Link
                    prefetch={false}
                    draggable={false}
                    href={blogHref}
                    className="blog-image"
                    aria-label={elem?.title || 'Read blog'}
                    tabIndex={-1}
                  >
                    <RatioImage
                      src={getOptimizedCdnImageUrl(
                        elem?.blog_thumbnail?.original_url || elem?.coverImage,
                        classes?.width || 300,
                        classes?.height || 150,
                        80
                      )}
                      className="bg-img"
                      alt={elem?.coverImageAlt || elem?.title || 'Blog image'}
                      draggable={false}
                      height={classes?.height || 150}
                      width={classes?.width || 300}
                    />
                  </Link>

                  <BlogBookmarkButton
                    blog={elem}
                    className="feature-blog-bookmark"
                    style={{ top: '16px', right: '16px' }}
                  />
                </div>

                <div className="blog-detail feature-blog-detail">
                  <Link prefetch={false} draggable={false} href={blogHref} className="feature-blog-title-link" tabIndex={-1}>
                    <h5>{elem?.title}</h5>
                  </Link>

                  <div className="feature-blog-meta-row">
                    <div className="feature-blog-meta-left">
                      {!!categoryName && (
                        <Link draggable={false}
                          prefetch={false}
                          href={categoryHref}
                          className="feature-blog-category"
                          tabIndex={-1}
                        >
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

                    <Link draggable={false}
                      href={blogHref}
                      prefetch={false}
                      className="feature-blog-arrow"
                      aria-label={`Open blog: ${elem?.title || ''}`}
                      title="Open blog"
                      tabIndex={-1}
                    >
                      <RiArrowRightUpLine />
                    </Link>
                  </div>

                  {/* keep date for accessibility / optional future use */}
                  <span className="visually-hidden">
                    {dateFormat(elem?.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default FeatureBlog;
