import React, { useCallback, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Link from 'next/link';
import { RiArticleLine } from 'react-icons/ri';
import BlogCardContain from './BlogCard';
import Pagination from '@/components/common/Pagination';
import { useSearchParams, useRouter } from 'next/navigation';
import BlogSkeletonComponent from './BlogSkeletonComponent';
import SkSearchBar from '@/components/common/skeletonLoader/SkSearchBar';
import { useBlogs } from '@/utils/hooks/useBlogs';
import CommonSearchBar from '@/components/common/CommonSearchBar';
import CustomDropdown from '@/components/common/CustomDropdown';
import { fetchBlogSuggestions } from '@/api/blog.api';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A to Z', value: 'name_asc' },
  { label: 'Z to A', value: 'name_desc' },
];

const BlogCard = ({ categorySlug, noSidebar = false }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const querySearchTag = searchParams?.get('tag');
  const querySearch = searchParams?.get('search') ?? '';
  const querySort = searchParams?.get('sort') ?? 'newest';
  const queryBoxStyle = searchParams?.get('style');
  const querySidebar = searchParams?.get('sidebar');
  const sortByParam = searchParams.get('sortBy') || 'newest';
  const [sortBy, setSortBy] = useState(sortByParam);

  // Map sort value to API parameters
  const getSortParams = (sortValue) => {
    switch (sortValue) {
      case 'newest':
        return { field: 'created_at', sortBy: 'newest' };
      case 'oldest':
        return { field: 'created_at', sortBy: 'oldest' };
      case 'name_asc':
        return { field: 'clinicName', sortBy: 'name_asc' };
      case 'name_desc':
        return { field: 'clinicName', sortBy: 'name_desc' };
      default:
        return { field: 'created_at', sortBy: 'newest' };
    }
  };

  const sortParams = getSortParams(sortBy);

  // Read page from URL (same as Press page) so pagination clicks update data
  const rawPage = Number(searchParams?.get('page'));
  const currentPage =
    Number.isFinite(rawPage) && Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;
  // Force list_view and right_sidebar as defaults when no query params are present
  // Query params can still override if needed
  const finalBoxStyle = queryBoxStyle || 'list_view';
  const finalSidebarStyle = noSidebar
    ? 'no_sidebar'
    : querySidebar || 'right_sidebar';
  const styleObj = {
    no_sidebar: { colClass: { xxl: 12, xl: 12, lg: 12 } },
    left_sidebar: { class: 'order-lg-2', colClass: { xxl: 8, xl: 8, lg: 7 } },
    right_sidebar: { colClass: { xxl: 8, xl: 8, lg: 7 } },
    list_view: { class: 'blog-list', colClass: { xs: 12 } },
    grid_view: { colClass: { xxl: 4, sm: 6 } },
  };
  const {
    data: BlogData,
    isLoading,
    isError,
  } = useBlogs({
    page: currentPage,
    limit: 10,
    category: categorySlug ?? '',
    tag: querySearchTag ?? '',
    search: querySearch,
    sortBy: sortParams.sortBy,
    field: sortParams.field,
  });

  const hasNoBlogs = !isLoading && (isError || !BlogData?.data?.length);

  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      const base = categorySlug ? `/blogs/${categorySlug}` : '/blogs';
      const qs = newParams.toString();
      router.push(qs ? `${base}?${qs}` : base, { scroll: false });
    },
    [searchParams, router, categorySlug]
  );

  const handleBlogSearch = useCallback(
    (query) => {
      updateURL({ search: query, page: 1 });
    },
    [updateURL]
  );

  const handleSortChange = useCallback(
    (newSortBy) => {
      const resolvedSort = newSortBy || 'newest';
      setSortBy(resolvedSort);
      updateURL({
        sortBy: resolvedSort === 'newest' ? '' : resolvedSort,
        page: 1,
      });
    },
    [updateURL]
  );

  const slugify = useCallback((s) => {
    if (!s) return '';
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }, []);

  const transformBlogResult = useCallback(
    (blog) => ({
      id: blog.uid,
      title: blog.title,
      subtitle: blog.blogCategory?.name || '',
      slug: blog.slug,
      categorySlug:
        blog.blogCategory?.slug || slugify(blog.blogCategory?.name) || 'blog',
      searchableFields: ['title', 'subtitle'],
    }),
    [slugify]
  );

  const handleSelectBlog = useCallback(
    (item) => {
      if (item?.slug) {
        const catSlug = item.categorySlug || 'blog';
        router.push(`/blogs/${catSlug}/${item.slug}`, { scroll: false });
      }
    },
    [router]
  );

  if (hasNoBlogs) {
    return (
      <Col xs={12}>
        <div className="empty-cart-box my-5">
          <div className="empty-icon">
            <RiArticleLine />
          </div>
          <h5>Currently you don&apos;t have blogs to see</h5>
          <Link
            href="/"
            className="btn btn-md theme-bg-color text-white mt-3 d-inline-block"
          >
            Go to Home
          </Link>
        </div>
      </Col>
    );
  }

  return (
    <>
      {/* Full-width search & sort (col 12) */}
      <Col xs={12}>
        {isLoading ? (
          <SkSearchBar />
        ) : (
          <div className="events-search-sort-row">
            <Row className="g-2 g-md-4">
              <Col lg={8} md={8}>
                <CommonSearchBar
                  storageKey="recent_blog_searches"
                  placeholderWords={[
                    'Ayurveda tips',
                    'Wellness articles',
                    'Health guides',
                  ]}
                  searchLabel="Search blogs"
                  enableFuzzyMatch={true}
                  autoSearch={false}
                  fetchResults={fetchBlogSuggestions}
                  transformResults={transformBlogResult}
                  onSearch={handleBlogSearch}
                  onSelectItem={handleSelectBlog}
                  initialValue={querySearch}
                />
              </Col>
              <Col lg={4} md={4}>
                <CustomDropdown
                  label=""
                  value={sortBy || 'newest'}
                  options={SORT_OPTIONS}
                  onChange={handleSortChange}
                  className="h-100"
                />
              </Col>
            </Row>
          </div>
        )}
      </Col>

      {/* Blog listing column (respects sidebar layout) */}
      <Col
        {...styleObj[finalSidebarStyle]?.colClass}
        className={styleObj[finalSidebarStyle]?.class || ''}
      >
        {isLoading ? (
          <BlogSkeletonComponent boxStyle={finalBoxStyle} />
        ) : (
          <Row className={`g-4 `}>
            {BlogData?.data?.map((blog, i) => (
              <Col {...styleObj[finalBoxStyle]?.colClass} key={i}>
                <div
                  // className={`blog-box ${blog?.is_sticky === 1 ? 'sticky-blog-box' : ''} ${styleObj[finalBoxStyle]?.class}`}
                  className={`blog-box ${styleObj[finalBoxStyle]?.class}`}
                >
                  <BlogCardContain blog={blog} categorySlug={categorySlug} />
                </div>
              </Col>
            ))}
          </Row>
        )}
        {BlogData?.data?.length > 0 && (
          <nav className="custome-pagination">
            <Pagination
              total={BlogData?.total ?? 0}
              perPage={BlogData?.per_page ?? 10}
            />
          </nav>
        )}
      </Col>
    </>
  );
}

export default BlogCard;
