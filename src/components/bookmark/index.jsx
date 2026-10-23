'use client';
import { useState } from 'react';
import { Col, Row } from 'reactstrap';
import Link from 'next/link';
import { RiBookmarkLine } from 'react-icons/ri';
import WrapperComponent from '../common/WrapperComponent';
import OtpLoginModal from '../auth/login/OtpLoginModal';
import { useBlogBookmarksListing } from '@/utils/hooks/useBlogBookmarks';
import { useUser } from '@/utils/hooks/useUser';
import Btn from '@/elements/buttons/Btn';
import BlogCardContain from '@/components/blogs/blogCard/BlogCard';
import BlogSkeletonComponent from '@/components/blogs/blogCard/BlogSkeletonComponent';
import Loader from '@/layout/loader';

const BookmarkContent = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 1. Fetch authentication state
  const { isAuthenticated, isUserLoading: isAuthLoading } = useUser();

  // 2. Fetch blog bookmarks state
  const {
    data,
    isLoading: isBlogLoading,
  } = useBlogBookmarksListing({ page: 1, limit: 20 });

  const bookmarkedBlogs =
    data?.success && Array.isArray(data?.data?.blogs)
      ? data.data.blogs.map((blog) => ({
        ...blog,
        is_bookmarked: true,
      }))
      : [];

  // --- STATE 1: LOADING (Auth check OR Blog data fetch) ---
  const isPageLoading =
    isAuthLoading ||
    isBlogLoading ||
    (isAuthenticated && data === undefined);

  if (isPageLoading) {
    return <Loader />;
  }

  // --- STATE 2: NOT AUTHENTICATED (Show Login Wall) ---
  if (!isAuthenticated) {
    return (
      <>
        <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
          <div className="empty-cart-box my-5 text-center no-data-added">
            <div className="empty-icon">
              <RiBookmarkLine />
            </div>
            <h4>Please login to view your bookmarked blogs.</h4>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Link
                href="/blogs"
                className="btn btn-md btn-primary d-inline-block"
              >
                Explore Blogs
              </Link>
              <Btn
                color="secondary"
                size="md"
                onClick={() => setLoginModalOpen(true)}
                className="btn btn-md d-inline-block"
              >
                Login
              </Btn>
            </div>
          </div>
        </WrapperComponent>

        <OtpLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          setOpen={setLoginModalOpen}
        />
      </>
    );
  }

  // --- STATE 3: AUTHENTICATED BUT BOOKMARKS ARE EMPTY ---
  if (!bookmarkedBlogs?.length) {
    return (
      <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
        <div className="empty-cart-box my-5 text-center no-data-added">
          <div className="empty-icon">
            <RiBookmarkLine />
          </div>
          <h4>Your bookmarks list is currently empty.</h4>
          <p>
            Save your favorite articles here to read them later!
          </p>
          <Link
            href="/blogs"
            className="btn btn-md btn-primary mt-3 d-inline-block"
          >
            Explore Blogs
          </Link>
        </div>
      </WrapperComponent>
    );
  }

  // --- STATE 4: FINAL RENDER (Authenticated & Bookmarks Found) ---
  return (
    <WrapperComponent
      classes={{ sectionClass: 'blog-section section-b-space', row: 'g-4' }}
      customCol={true}
    >
      {bookmarkedBlogs.map((blog) => {
        const categorySlug =
          blog?.categories?.[0]?.slug || blog?.blogCategory?.slug || '';

        return (
          <Col xs={12} key={blog?.uid || blog?.id}>
            <div className="blog-box blog-list">
              <BlogCardContain blog={blog} categorySlug={categorySlug} />
            </div>
          </Col>
        );
      })}
    </WrapperComponent>
  );
};

export default BookmarkContent;
