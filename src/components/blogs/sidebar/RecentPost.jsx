'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import Avatar from '@/components/common/Avatar';
import BlogContext from '@/helper/blogContext';
import { usePathname } from 'next/navigation';
import { RiArrowRightUpLine } from 'react-icons/ri';
import { authorFallbackImage, brandLogo } from '@/data/CommonPath';

const RecentPost = ({ categorySlug }) => {
  const { recentPosts } = useContext(BlogContext);
  const pathname = usePathname();

  const sourcePosts = recentPosts || [];
  const latestPosts = sourcePosts.slice(0, 3);

  // Hide "view more" button on blog listing page (/blogs/[category]), show on single blog pages
  const pathSegments = pathname.split('/').filter(Boolean);
  const isBlogListingPage =
    pathSegments.length === 2 && pathSegments[0] === 'blogs';

  const getBlogHref = (blog) => {
    const cat =
      blog?.categorySlug || blog?.categories?.[0]?.slug || categorySlug || '';
    return cat ? `/blogs/${cat}/${blog?.slug}` : `/blogs/${blog?.slug}`;
  };

  const getCategoryName = (blog) =>
    blog?.blogCategory?.name || blog?.categories?.[0]?.name || '';

  const getAuthorDisplayName = (createdBy) => {
    const name = createdBy?.name;
    if (name == null) return '';
    if (typeof name === 'string') return name.trim();
    return name?.name?.trim() ?? '';
  };

  const getAuthor = (blog) => {
    const name = getAuthorDisplayName(blog?.created_by) || 'Team SDL';
    const image = blog?.created_by?.image || blog?.author?.image || null;
    return { name, image };
  };

  return (
    <AccordionItem>
      <AccordionHeader targetId="1">Recent Post</AccordionHeader>

      <AccordionBody accordionId="1" className="pt-0">
        <div className="recent-post-box">
          {latestPosts?.map((blog, index) => (
            <React.Fragment key={blog?.id || blog?.uid || index}>
              <div className="recent-box recent-post-card">
                <Link
                  href={getBlogHref(blog)}
                  className="recent-post-card__image"
                  aria-label={blog?.title}
                >
                  <div className="recent-post-card__image-wrap">
                    <Avatar
                      data={blog?.blog_thumbnail?.original_url}
                      // placeHolder={placeHolderImage}
                      placeHolder={brandLogo}
                      name={blog?.title}
                      width={140}
                      height={140}
                    />
                  </div>
                </Link>

                <div className="recent-post-card__content">
                  {getCategoryName(blog) && (
                    <div className="recent-post-card__top">
                      <span className="recent-post-card__category">
                        {getCategoryName(blog)}
                      </span>
                    </div>
                  )}

                  <Link
                    href={getBlogHref(blog)}
                    className="recent-post-card__title-link"
                  >
                    <h5 className="recent-post-card__title">{blog?.title}</h5>
                  </Link>

                  <div className="d-flex justify-content-between gap-2 align-items-center">
                    {(() => {
                      const author = getAuthor(blog);
                      return (
                        <div className="recent-post-card__author">
                          <span className="recent-post-card__author-avatar">
                            <Avatar
                              data={author?.image || authorFallbackImage}
                              // placeHolder={placeHolderImage}
                              placeHolder={authorFallbackImage}
                              name={author.name}
                              width={28}
                              height={28}
                            />
                          </span>
                          <span className="recent-post-card__author-name">
                            {author.name}
                          </span>
                        </div>
                      );
                    })()}

                    <Link
                      href={getBlogHref(blog)}
                      className="recent-post-card__arrow"
                      aria-label="Open post"
                    >
                      <RiArrowRightUpLine />
                    </Link>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* ---- View More Button ---- */}
          {!isBlogListingPage && sourcePosts.length > 3 && (
            <div className="text-center mt-3">
              <Link
                href={categorySlug ? `/blogs/${categorySlug}` : '/blogs'}
                className="btn btn-theme-outline btn-sm"
              >
                View More
              </Link>
            </div>
          )}
        </div>
      </AccordionBody>
    </AccordionItem>
  );
};

export default RecentPost;
