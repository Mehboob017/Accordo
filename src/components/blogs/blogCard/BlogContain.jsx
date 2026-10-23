import React from 'react';
import {
  RiTimeLine,
  RiArrowRightUpLine,
} from 'react-icons/ri';
import { dateFormat } from '@/utils/customFunctions/DateFormat';
import { authorFallbackImage } from '@/data/CommonPath';

const authorFallbackSrc = authorFallbackImage?.src ?? authorFallbackImage;

// Safely get author display name (API may return created_by.name as string or object { uid, name, image, imageAlt })
const getAuthorDisplayName = (createdBy) => {
  const name = createdBy?.name;
  if (name == null) return '';
  if (typeof name === 'string') return name;
  return name?.name ?? '';
};

const getAuthorImageSrc = (createdBy) => {
  const url = createdBy?.image || '';
  if (typeof url === 'string' && url.trim()) {
    return url.trim();
  }
  return authorFallbackSrc;
};

const BlogContain = ({ blog, categorySlug }) => {
  const catSlug = categorySlug || blog?.categories?.[0]?.slug || '';
  const blogHref = catSlug
    ? `/blogs/${catSlug}/${blog.slug}`
    : `/blogs/${blog.slug}`;
  const categoryName =
    blog?.blogCategory?.name || blog?.categories?.[0]?.name || '';

  return (
    <div className="blog-contain">
      {categoryName && (
        <span className="recent-post-card__category"> {categoryName}</span>
      )}

      <a href={blogHref}>
        <h3>{blog?.title}</h3>
      </a>
      {/* <TextLimit value={typeof blog?.description === 'string' ? blog.description : ''} maxLength={200} tag="p" /> */}
      <p className="lc-3">{blog.description}</p>

      <div className="blog-label">
        <span
          className="super"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'capitalize',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid #e2e2e2',
            }}
          >
            <img
              src={getAuthorImageSrc(blog?.created_by)}
              alt={getAuthorDisplayName(blog?.created_by) || 'Team SDL'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.src = authorFallbackSrc;
              }}
            />
          </div>
          {getAuthorDisplayName(blog?.created_by) || 'Team SDL'}
        </span>

        <span className="time">
          <RiTimeLine />
          {dateFormat(blog?.created_at)}
        </span>
        {/* {themeOption?.blog?.blog_author_enable && authorName && ( */}

        {/* )} */}
      </div>

      <a href={blogHref} className="blog-button btn-primary">
        Read More <RiArrowRightUpLine />
      </a>
    </div>
  );
};

export default BlogContain;
