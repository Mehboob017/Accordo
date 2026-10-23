import SingleBlog from '@/components/blogs/singleBlog';
import { fetchBlogBySlug } from '@/api/blog.api';
import {
  generateDynamicSeoMetadata,
  getDynamicSeo,
  SEO_TYPES,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import { dateFormat } from '@/utils/customFunctions/DateFormat';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import Loader from '@/layout/loader';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function getBlogFallbackMetadata(blogslug, categoryname) {
  try {
    const data = await fetchBlogBySlug(blogslug);
    const blog = data?.blog || {};
    const rawBlog = data?.raw?.data?.blog || {};
    const title = blog.title || rawBlog.title || 'Blog';

    const contentText = stripHtml(
      `${rawBlog.description1 || ''} ${rawBlog.description2 || ''}`
    );
    const description =
      (contentText ? contentText.slice(0, 160) : '') ||
      title;

    const imageUrl =
      blog.banner_image ||
      rawBlog.bannerImage ||
      blog.blog_thumbnail?.original_url ||
      rawBlog.coverImage ||
      '';

    return {
      title,
      description: description.slice(0, 160),
      openGraph: {
        title,
        description: description.slice(0, 160),
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return null;
  }
}

function createBlogSchema(blogData, categoryname, blogslug) {
  const blog = blogData?.blog;
  const rawBlog = blogData?.raw?.data?.blog;
  const rawAuthors = blogData?.raw?.data?.authors;

  if (!blog && !rawBlog) {
    return null;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com';

  const pageUrl = `${siteUrl}/blogs/${categoryname}/${blogslug}`;
  const webpageId = `${pageUrl}#webpage`;
  const articleId = `${pageUrl}#article`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const websiteId = `${siteUrl}/#website`;
  const organizationId = `${siteUrl}/#organization`;

  const title = blog?.title || rawBlog?.title || '';

  // Clean description extracted from description1 & description2
  const contentText = stripHtml(
    `${rawBlog?.description1 || ''} ${rawBlog?.description2 || ''}`
  );
  // const description =
  //   (contentText ? contentText.slice(0, 300) : '') ||
  //   title;
  const description = contentText || title;

  const imageUrl =
    blog?.banner_image ||
    rawBlog?.bannerImage ||
    blog?.blog_thumbnail?.original_url ||
    rawBlog?.coverImage ||
    '';

  const dateValue = blog?.created_at || rawBlog?.date || rawBlog?.created_at;
  const datePublished = dateValue ? dateFormat(dateValue) : undefined;

  const dateModifiedValue = rawBlog?.updated_at || blog?.updated_at;
  const dateModified = dateModifiedValue ? dateFormat(dateModifiedValue) : undefined;

  const categoryName =
    blog?.blogCategory?.name ||
    rawBlog?.blogCategory?.name ||
    undefined;

  const keywords = rawBlog?.keywords || blog?.raw_keywords || undefined;

  let authorName =
    blog?.created_by?.name ||
    rawAuthors?.[0]?.name ||
    (typeof rawBlog?.authors?.[0] === 'string' ? rawBlog.authors[0] : rawBlog?.authors?.[0]?.name) ||
    '';

  if (!authorName && rawAuthors?.[0]) {
    const a = rawAuthors[0];
    const sal = String(a?.salutation || '').trim();
    const first = String(a?.firstName || '').trim();
    const last = String(a?.lastName || '').trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    authorName = sal ? `${sal} ${full}`.trim() : (full || a?.name || '');
  }

  // 1. WebPage Node
  const webpageNode = {
    '@type': 'WebPage',
    '@id': webpageId,
    url: pageUrl,
    name: title,
    isPartOf: {
      '@id': websiteId,
    },
    about: {
      '@id': articleId,
    },
    breadcrumb: {
      '@id': breadcrumbId,
    },
    inLanguage: 'en-IN',
  };

  // 2. BlogPosting Node
  const blogPostingNode = {
    '@type': 'BlogPosting',
    '@id': articleId,
    headline: title,
    description: description,
    url: pageUrl,
    ...(imageUrl
      ? {
        image: {
          '@type': 'ImageObject',
          url: imageUrl,
        },
      }
      : {}),
    author: authorName
      ? {
        '@type': 'Person',
        name: authorName,
      }
      : undefined,
    publisher: {
      '@id': organizationId,
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(categoryName ? { articleSection: categoryName } : {}),
    ...(keywords ? { keywords } : {}),
    mainEntityOfPage: {
      '@id': webpageId,
    },
    inLanguage: 'en-IN',
  };

  // 3. Author Node
  const authorNode = authorName
    ? {
      '@type': 'Author',
      name: authorName,
    }
    : null;

  // 4. BreadcrumbList Node
  const breadcrumbNode = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: pageUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const graph = [
    webpageNode,
    blogPostingNode,
    ...(authorNode ? [authorNode] : []),
    breadcrumbNode,
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export async function generateMetadata({ params }) {
  const { categoryname, blogslug } = await params;
  const path = `/blogs/${categoryname}/${blogslug}`;
  const fallbackMetadata = await getBlogFallbackMetadata(blogslug, categoryname);

  return generateDynamicSeoMetadata(blogslug, SEO_TYPES.BLOG, {
    path,
    fallbackMetadata,
  });
}

const BlogDetailPage = async ({ params }) => {
  const { categoryname, blogslug } = await params;
  const path = `/blogs/${categoryname}/${blogslug}`;
  const { schemas } = await getDynamicSeo(blogslug, SEO_TYPES.BLOG, path);

  const queryClient = getQueryClient();
  const blogData = await queryClient
    .fetchQuery({
      queryKey: ['blog', blogslug],
      queryFn: () => fetchBlogBySlug(blogslug),
    })
    .catch(() => null);

  const blogSchema = createBlogSchema(blogData, categoryname, blogslug);

  const allSchemas = [
    ...schemas,
    ...(blogSchema ? [blogSchema] : []),
  ];

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={allSchemas} />
      <Suspense fallback={<Loader />}>
        <SingleBlog categorySlug={categoryname} blogSlug={blogslug} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default BlogDetailPage;
