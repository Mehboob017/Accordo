'use client';

import { useEffect, useState } from 'react';
import BlogContain from './BlogContain';
import { brandLogo } from '../../../data/CommonPath';
import BlogBookmarkButton from '@/components/blogs/BlogBookmarkButton';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

const brandLogoSrc = brandLogo?.src ?? brandLogo;

const getBlogImageSrc = (blog) => {
  const url =
    blog?.blog_thumbnail?.original_url ||
    blog?.coverImage ||
    blog?.blog_thumbnail?.url ||
    '';

  if (typeof url === 'string' && url.trim()) {
    return getOptimizedCdnImageUrl(url.trim(), 490, 244, 80);
  }

  return brandLogoSrc;
};

const BlogCardContain = ({ blog, categorySlug }) => {
  const catSlug = categorySlug || blog?.categories?.[0]?.slug || '';
  const blogHref = catSlug ? `/blogs/${catSlug}/${blog.slug}` : `/blogs/${blog.slug}`;
  const [blogImageSrc, setBlogImageSrc] = useState(() => getBlogImageSrc(blog));

  useEffect(() => {
    setBlogImageSrc(getBlogImageSrc(blog));
  }, [blog]);

  return (
    <>
      <div className="blog-image position-relative">
        <BlogBookmarkButton
          blog={blog}
          style={{ top: '1rem', right: '1rem' }}
        />
        <a href={blogHref}>
          <img
            src={blogImageSrc}
            alt={blog?.title || 'blog-image'}
            height={244}
            width={490}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => {
              if (blogImageSrc !== brandLogoSrc) setBlogImageSrc(brandLogoSrc);
            }}
          />
        </a>
      </div>
      <BlogContain blog={blog} categorySlug={categorySlug} />
    </>
  );
};
export default BlogCardContain;
