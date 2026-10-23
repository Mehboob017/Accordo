'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// import Breadcrumb from '../common/Breadcrumb';
import BlogCard from './blogCard';
import Sidebar from './sidebar/Sidebar';
import WrapperComponent from '../common/WrapperComponent';
import { useBlogs } from '@/utils/hooks/useBlogs';
import { RiArticleLine } from 'react-icons/ri';

const BlogDetail = ({ categorySlug }) => {
  const searchParams = useSearchParams();
  const querySearch = searchParams?.get('search') ?? '';
  const { data, isLoading, isError } = useBlogs({
    page: 1,
    limit: 10,
    category: categorySlug ?? '',
    tag: searchParams?.get('tag') ?? '',
    search: querySearch,
  });
  const showOnlyEmpty =
    !isLoading && (isError || !data?.data?.length) && !querySearch;

  if (showOnlyEmpty) {
    return (
      <>
        <WrapperComponent
          classes={{ sectionClass: 'blog-section section-b-space' }}
          customCol={true}
        >
          <div className="empty-cart-box my-5">
            <div className="empty-icon">
              <RiArticleLine />
            </div>
            <h5>Currently you don&apos;t have blogs to see</h5>
            <a
              href="/"
              className="btn btn-md theme-bg-color text-white mt-3 d-inline-block"
            >
              Go to Home
            </a>
          </div>
        </WrapperComponent>
      </>
    );
  }

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space', row: 'g-4' }}
        customCol={true}
        noSectionTopSpace={true}
      >
        <BlogCard
          categorySlug={categorySlug}
          noSidebar={!isLoading && !data?.data?.length}
        />
        {(isLoading || data?.data?.length > 0) && (
          <Sidebar
            categorySlug={categorySlug}
            forceLoading={isLoading}
          />
        )}
      </WrapperComponent>
    </>
  );
};

export default BlogDetail;
