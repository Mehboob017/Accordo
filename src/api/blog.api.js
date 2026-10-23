const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;
import { getAuthHeaders } from '@/api/wishlist.api';

// Helper to strip basic HTML tags from API descriptions
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const slugifyTag = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

// Safely get author display name (API may return string or object { uid, name, image, imageAlt })
const getAuthorName = (author) => {
  if (author == null) return '';
  if (typeof author === 'string') return author;
  return author?.name ?? '';
};

// Build author name from recentPosts "author" shape
const getApiRecentAuthorName = (author) => {
  if (!author) return '';
  const sal = String(author?.salutation || '').trim();
  const first = String(author?.firstName || '').trim();
  const last = String(author?.lastName || '').trim();
  const full = [first, last].filter(Boolean).join(' ').trim();
  if (!full) return '';
  return sal ? `${sal} ${full}`.trim() : full;
};

// Get author image URL (API may return image as string URL or { original_url })
const getAuthorImage = (author) => {
  if (author == null || typeof author === 'string') return null;
  const img = author?.image ?? author?.profile_image ?? author?.profileImage;
  if (!img) return null;
  return typeof img === 'string' ? img : img?.original_url ?? null;
};

const normalizeBlog = (blog) => ({
  id: blog.uid,
  slug: blog.slug,
  title: blog.title,
  created_at: blog.date,
  created_by: blog.authors?.length
    ? { name: getAuthorName(blog.authors[0]), image: getAuthorImage(blog.authors[0]) }
    : { name: '', image: null },
  description: stripHtmlTags(blog.description1 || blog.description2),
  blog_thumbnail: {
    original_url: blog.coverImage,
  },
  is_featured: !!blog.verifiedFlag,
  is_sticky: blog.verifiedFlag ? 1 : 0,
  categories: blog.blogCategory
    ? [
      {
        uid: blog.blogCategory.uid,
        name: blog.blogCategory.name,
        slug: blog.blogCategory.slug,
      },
    ]
    : [],
  raw_keywords: blog.keywords || '',
});

const normalizeRecentPost = (post, apiBlogs) => {
  const fullBlog = apiBlogs.find((b) => b.uid === post.uid);
  const fallbackCategorySlug = fullBlog?.blogCategory?.slug || '';
  const apiCat = post?.blogCategory || fullBlog?.blogCategory || null;
  const categorySlug = apiCat?.slug || fallbackCategorySlug || '';
  const categoryName = apiCat?.name || '';
  const categoryUid = apiCat?.uid || '';

  const apiAuthor = post?.author || null;
  const authorName = getApiRecentAuthorName(apiAuthor);
  const authorImage = apiAuthor?.image || null;
  return {
    id: post.uid,
    slug: post.slug,
    title: post.title,
    created_at: post.created_at,
    categorySlug,
    categories: apiCat
      ? [
        {
          uid: categoryUid,
          name: categoryName,
          slug: categorySlug || slugifyTag(categoryName),
        },
      ]
      : [],
    created_by: { name: authorName, image: authorImage },
    author: apiAuthor
      ? {
        uid: apiAuthor?.uid || '',
        image: authorImage,
        firstName: apiAuthor?.firstName || '',
        lastName: apiAuthor?.lastName || '',
        salutation: apiAuthor?.salutation || '',
      }
      : null,
    blog_thumbnail: {
      original_url: post.coverImage,
    },
  };
};

/**
 * Fetch blogs from SDL server and normalize into the "theme blog" shape
 * used across the app (id/slug/title/is_featured/etc).
 */
export const fetchBlogs = async ({
  page = 1,
  limit = 10,
  category = '',
  tag = '',
  search = '',
  sortBy = '',
} = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  if (search && String(search).trim()) params.set('search', String(search).trim());
  if (sortBy && String(sortBy).trim()) params.set('sort', String(sortBy).trim());

  const res = await fetch(`${SDL_BASE_URL}/blogs?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blogs');
  }

  const json = await res.json();
  const payload = json?.data || {};
  const apiBlogs = payload.blogData || [];
  const apiRecent = payload.recentPosts || [];
  const apiCategories = payload.categories || [];
  const pagination = payload.pagination || {};

  const normalized = apiBlogs.map(normalizeBlog);

  const normalizedRecent =
    apiRecent.length > 0
      ? apiRecent.map((post) => normalizeRecentPost(post, apiBlogs))
      : normalized.map((b) => ({
        ...b,
        categorySlug: b.categories?.[0]?.slug || '',
      }));

  const normalizedCategories = apiCategories.map((cat) => ({
    uid: cat.uid,
    name: cat.name,
    slug: cat.slug,
    blogs_count: cat._count?.blogs ?? 0,
  }));

  // Build tag list from blogs.keywords (comma-separated)
  const tagMap = new Map();
  normalized.forEach((blog) => {
    const raw = blog.raw_keywords || '';
    raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .forEach((name) => {
        const slug = slugifyTag(name);
        if (!slug) return;
        if (!tagMap.has(slug)) tagMap.set(slug, { name, slug });
      });
  });
  const normalizedTags = Array.from(tagMap.values());

  // Provide pagination fields expected by existing UI components.
  // If API doesn't provide totals, fall back to normalized length.
  return {
    data: normalized,
    recentPosts: normalizedRecent,
    categories: normalizedCategories,
    tags: normalizedTags,
    current_page: pagination.page ?? page,
    per_page: pagination.limit ?? limit,
    total: pagination.total ?? normalized.length,
    raw: json,
  };
};

/**
 * Normalize a single blog from detail API to the "theme blog" shape.
 */
const normalizeBlogDetail = (blog, authors = []) => {
  const rawAuthor =
    authors?.[0] ?? (Array.isArray(blog?.authors) ? blog.authors[0] : blog?.authors);
  const authorName = getAuthorName(rawAuthor);
  const authorImage = getAuthorImage(rawAuthor);
  const content = [blog?.description1, blog?.description2].filter(Boolean).join('\n') || '';
  return {
    id: blog.uid,
    slug: blog.slug,
    title: blog.title,
    subtitle: blog.subtitle,
    seo_title: blog.seo_title || blog.subtitle,
    created_at: blog.date || blog.created_at,
    created_by: { name: authorName, image: authorImage },
    content,
    blog_thumbnail: {
      original_url: blog.coverImage,
    },
    banner_image: blog.bannerImage,
    is_featured: !!blog.verifiedFlag,
    is_sticky: blog.verifiedFlag ? 1 : 0,
    categories: blog.blogCategory
      ? [
        {
          uid: blog.blogCategory.uid,
          name: blog.blogCategory.name,
          slug: blog.blogCategory.slug,
        },
      ]
      : [],
    raw_keywords: blog.keywords || '',
    // Pass through blog media from detail API so UI can render it
    blogMedias: Array.isArray(blog.blogMedias) ? blog.blogMedias : [],
    // Optional snake_case alias for legacy components
    blog_medias: Array.isArray(blog.blogMedias) ? blog.blogMedias : [],
  };
};

/**
 * Normalize product from blog-detail API for "You may also like" (ProductBox1 shape).
 */
const normalizeBlogProduct = (product) => {
  const variant = product.productVariants?.[0];
  const mrp = variant?.mrp ?? 0;
  const disPrice = variant?.disPrice ?? mrp;
  return {
    id: product.uid,
    slug: product.slug,
    name: product.name,
    short_description: product.shortDescription ?? null,
    // Keep same shape as product listing APIs (string URL)
    product_thumbnail: product.coverImage || null,
    price: mrp,
    sale_price: disPrice,
    unit: variant?.weight || '',
    stock_status: variant?.inStockFlag ? 'in_stock' : 'out_of_stock',
  };
};

/**
 * Normalize related/recent post from detail API for slider.
 */
const normalizeRelatedPost = (post, categorySlug = '') => ({
  id: post.uid,
  slug: post.slug,
  title: post.title,
  created_at: post.created_at,
  categorySlug,
  viewCount: post.viewCount,
  blog_thumbnail: {
    original_url: post.coverImage,
  },
  categories: post.blogCategory
    ? [{ uid: post.blogCategory.uid, name: post.blogCategory.name, slug: post.blogCategory.slug }]
    : [],
});

const normalizeBookmarkedBlog = (blog) => ({
  uid: blog.uid,
  id: blog.uid,
  slug: blog.slug,
  title: blog.title,
  created_at: blog.date || blog.created_at,
  created_by: {
    name: getAuthorName(blog.author),
    image: getAuthorImage(blog.author),
  },
  description: stripHtmlTags(blog.description1 || blog.description2),
  blog_thumbnail: {
    original_url: blog.coverImage,
  },
  categories: blog.category
    ? [
      {
        uid: blog.category.uid,
        name: blog.category.name,
        slug: blog.category.slug,
      },
    ]
    : [],
  raw_keywords: '',
  is_featured: false,
  is_sticky: 0,
  view_count: blog.viewCount ?? 0,
  is_bookmarked: true,
  isBookmarked: true,
  bookmarked: true,
  bookmark: true,
});

/**
 * Fetch blog suggestions for search dropdown (search by title and category).
 * API: GET /search/blogs?search={term}
 */
export const fetchBlogSuggestions = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  const url = `${SDL_BASE_URL}/search/blogs?search=${encodeURIComponent(searchTerm)}`;

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blog suggestions');
  }

  const json = await res.json();

  if (!json.success || !Array.isArray(json.data?.blogs)) {
    return [];
  }

  return json.data.blogs;
};

/**
 * Search blogs by title and category.
 * Returns data in the same shape as fetchBlogs for compatibility.
 */
export const fetchBlogSearch = async ({ search = '', page = 1, limit = 10 } = {}) => {
  if (!search || !search.trim()) {
    return { data: [], current_page: page, per_page: limit, total: 0 };
  }

  const params = new URLSearchParams();
  params.set('search', search.trim());
  if (page > 1) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));

  const res = await fetch(`${SDL_BASE_URL}/search/blogs?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to search blogs');
  }

  const json = await res.json();
  const apiBlogs = json?.data?.blogs || [];
  const count = json?.data?.count ?? apiBlogs.length;

  // Normalize search response to theme blog shape (minimal fields from search API)
  const normalized = apiBlogs.map((blog) => ({
    id: blog.uid,
    slug: blog.slug,
    title: blog.title,
    created_at: blog.date || blog.created_at || '',
    created_by: { name: '' },
    description: '',
    blog_thumbnail: { original_url: blog.coverImage || null },
    is_featured: false,
    is_sticky: 0,
    categories: blog.blogCategory
      ? [
        {
          uid: blog.blogCategory.uid,
          name: blog.blogCategory.name,
          slug: blog.blogCategory?.slug ?? slugifyTag(blog.blogCategory.name),
        },
      ]
      : [],
  }));

  return {
    data: normalized,
    recentPosts: [],
    categories: [],
    tags: [],
    current_page: page,
    per_page: limit,
    total: count,
  };
};

export const fetchBlogBySlug = async (slug) => {
  const res = await fetch(`${SDL_BASE_URL}/blog-detail/?slug=${slug}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blog');
  }

  const json = await res.json();
  const payload = json?.data || {};
  const blog = payload.blog || {};
  const authors = payload.authors || [];
  const relatedBlogs = payload.relatedBlogs || [];
  const recentPosts = payload.recentPosts || [];
  const categories = payload.categories || [];
  const products = payload.products || [];

  const normalizedBlog = normalizeBlogDetail(blog, authors);

  // Related blogs: use ONLY relatedBlogs from API (no fallback to recentPosts)
  const fallbackCategorySlug = blog.blogCategory?.slug || '';
  const normalizedRelated = relatedBlogs.map((post) =>
    normalizeRelatedPost(post, post.blogCategory?.slug || fallbackCategorySlug)
  );

  // Products for "You may also like" section
  const normalizedProducts = products.map(normalizeBlogProduct);

  return {
    blog: normalizedBlog,
    relatedBlogs: normalizedRelated,
    products: normalizedProducts,
    categories,
    raw: json,
  };
};

const BLOG_BOOKMARK_ARRAY_ENDPOINT = `${SDL_BASE_URL}/bookmark-array`;

export const toggleBlogBookmark = async ({ blogUid, add = true } = {}) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  if (!blogUid) {
    throw new Error('Blog id is required');
  }

  const response = await fetch(`${SDL_BASE_URL}/save-bookmark`, {
    method: 'POST',
    cache: 'no-store',
    body: JSON.stringify({ add, type: 'blog', typeUid: blogUid }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update blog bookmark');
  }

  return response.json();
};

export const fetchBlogBookmarkArray = async () => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const response = await fetch(BLOG_BOOKMARK_ARRAY_ENDPOINT, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch blog bookmark array');
  }

  return response.json();
};

export const fetchBlogBookmarkListing = async ({ page = 1, limit = 10 }) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();
  params.set('type', 'blog');
  params.set('page', String(page));
  params.set('limit', String(limit));

  const response = await fetch(`${SDL_BASE_URL}/bookmark-listing?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch bookmarked blogs');
  }

  const json = await response.json();
  const blogs = Array.isArray(json?.data?.blogs) ? json.data.blogs : [];
  const count = Number(json?.data?.count ?? blogs.length);

  return {
    success: !!json?.success,
    message: json?.message || 'Blog bookmarks fetched successfully',
    data: {
      blogs: blogs.map(normalizeBookmarkedBlog),
      count,
    },
    current_page: page,
    per_page: limit,
    total: count,
    raw: json,
  };
};

