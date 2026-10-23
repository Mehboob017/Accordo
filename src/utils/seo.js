import { cache } from 'react';
import { fetchSeoBySlug } from '@/api/seo.api';

export const SEO_SLUG_PATHS = {
  home: '/',
  'contact-us': '/contact-us',
  career: '/careers',
  faqs: '/faqs',
  press: '/press',
  cultivators: '/cultivators',
  clinics: '/find-the-clinic',
  stores: '/find-the-store',
  herbs: '/herbs',
  events: '/events',
  blogs: '/blogs',
  wishlist: '/wishlist',
  collections: '/collections',
  'health-concerns': '/health-concerns',
  'our-story': '/our-story',
  leadership: '/leadership',
  'quality-and-research': '/quality-and-research',
  'our-ecosystem': '/our-ecosystem',
  'legacy-and-impact': '/legacy-and-impact',
  'journal-publication': '/resources/journal-publication',
  'sdl-publication': '/resources/sdl-publication',
};

export const SEO_TYPES = {
  STATIC: 'Static',
  BLOG: 'Blog',
  PRODUCT: 'Product',
  EVENT: 'Event',
  HERB: 'Herb',
  HEALTH_CONCERN: 'Health Concern',
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com';

const SCHEMA_FIELDS = [
  'articleSchema',
  'organizationSchema',
  'websiteSchema',
  'localSchema',
  'otherSchema',
];

function parseRobots(robot) {
  if (!robot) {
    return { index: true, follow: true };
  }

  const parts = robot.toLowerCase().split(',').map((part) => part.trim());

  return {
    index: !parts.includes('noindex'),
    follow: !parts.includes('nofollow'),
  };
}

function parseSchemaString(raw) {
  if (!raw) {
    return null;
  }

  if (typeof raw === 'object') {
    return raw;
  }

  if (typeof raw !== 'string') {
    return null;
  }

  let str = raw.trim();
  if (!str) {
    return null;
  }

  // Strip <script ...> and </script> tags if wrapped in HTML
  str = str.replace(/<script\b[^>]*>/gi, '').replace(/<\/script>/gi, '').trim();

  if (!str) {
    return null;
  }

  // Try direct parse first
  try {
    return JSON.parse(str);
  } catch {
    let cleaned = str;
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      if (cleaned.startsWith('"')) {
        cleaned = `{${cleaned}`;
      } else if (cleaned.startsWith('@')) {
        cleaned = `{"${cleaned}`;
      } else {
        cleaned = `{${cleaned}`;
      }
    }

    if (!cleaned.endsWith('}') && !cleaned.endsWith(']')) {
      cleaned = `${cleaned}}`;
    }

    try {
      return JSON.parse(cleaned);
    } catch {
      try {
        return JSON.parse(cleaned.replace(/\n/g, ' ').replace(/,\s*([}\]])/g, '$1'));
      } catch {
        return null;
      }
    }
  }
}

export function parseSeoSchemas(seoData) {
  if (!seoData) {
    return [];
  }

  return SCHEMA_FIELDS.map((field) => parseSchemaString(seoData[field])).filter(
    Boolean
  );
}

function slugToTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFallbackMetadata(slug, path) {
  const canonicalPath = path || SEO_SLUG_PATHS[slug] || `/${slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const pageName = slugToTitle(slug === 'home' ? 'Home' : slug);
  const title = pageName;
  const description = `Discover ${pageName} at SDL India, a leading Ayurvedic company in India.`;

  return {
    title,
    description,
    other: {
      title,
    },
    keywords: `SDL India, ${pageName}, Ayurvedic company, India`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'SDL India',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function mapSeoToMetadata(seoData, { slug, path } = {}) {
  if (!seoData) {
    return getFallbackMetadata(slug, path);
  }

  const canonicalPath = path || SEO_SLUG_PATHS[slug] || `/${slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const metadata = {
    title: {
      absolute: seoData.title,
    },
    description: seoData.metaDescription,
    other: {
      title: seoData.metaTitle,
    },
    keywords: seoData.metaKeyword,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoData.ogTitle || seoData.metaTitle || seoData.title,
      description: seoData.ogDescription || seoData.metaDescription,
      type: seoData.ogType || 'website',
      siteName: seoData.ogSiteName || 'SDL India',
      url: canonicalUrl,
    },
    twitter: {
      card: seoData.twitterType || 'summary_large_image',
      title: seoData.twitterTitle || seoData.ogTitle || seoData.metaTitle || seoData.title,
      description:
        seoData.twitterDescription ||
        seoData.ogDescription ||
        seoData.metaDescription,
    },
  };

  if (seoData.ogImage) {
    metadata.openGraph.images = [
      {
        url: seoData.ogImage,
        width: 1200,
        height: 630,
        alt: seoData.ogTitle || seoData.metaTitle || 'SDL India',
      },
    ];
  }

  if (seoData.twitterImage) {
    metadata.twitter.images = [seoData.twitterImage];
  }

  if (seoData.robot) {
    metadata.robots = parseRobots(seoData.robot);
  }

  return metadata;
}

export const getSeo = cache(async (slug, type = SEO_TYPES.STATIC, path = null) => {
  const response = await fetchSeoBySlug(slug, type);
  const seoData = response?.data || null;

  return {
    metadata: seoData
      ? mapSeoToMetadata(seoData, { slug, path: path || undefined })
      : null,
    schemas: parseSeoSchemas(seoData),
    raw: seoData,
  };
});

export const getStaticSeo = (slug, options = {}) => {
  const { type = SEO_TYPES.STATIC, path } = options;
  return getSeo(slug, type, path);
};

export const getDynamicSeo = (slug, type, path = null) => getSeo(slug, type, path);

export async function generateStaticSeoMetadata(slug, options = {}) {

  // console.log("SEO metadata called", slug);
  const { type = SEO_TYPES.STATIC, path } = options;
  const { metadata } = await getSeo(slug, type, path);
  return metadata || getFallbackMetadata(slug, path);
}

export async function generateDynamicSeoMetadata(
  slug,
  type,
  { path, fallbackMetadata } = {}
) {
  const { metadata } = await getSeo(slug, type, path);

  const mergedMetadata = {
    ...(fallbackMetadata || getFallbackMetadata(slug, path)),
    ...metadata,
  };

  if (type === SEO_TYPES.PRODUCT && fallbackMetadata?.product) {
    const productData = fallbackMetadata.product;
    const other = {
      ...(mergedMetadata.other || {}),
    };

    if (productData?.price?.amount) {
      other['product:price:amount'] = productData?.price?.amount;
    }
    if (productData?.price?.currency) {
      other['product:price:currency'] = productData?.price?.currency;
    }
    if (productData?.brand) {
      other['product:brand'] = productData?.brand;
    }
    if (productData?.manufacturer) {
      other['product:manufacturer'] = productData?.manufacturer;
    }
    if (productData?.availability) {
      other['product:availability'] = productData?.availability;
    }
    if (productData?.condition) {
      other['product:condition'] = productData?.condition;
    }
    if (productData?.retailerItemId) {
      other['product:retailer_item_id'] = productData?.retailerItemId;
    }
    if (productData?.category) {
      other['product:category'] = productData?.category;
    }
    if (productData?.mrp) {
      other['product:original_price:amount'] = productData?.mrp;
    }

    mergedMetadata.other = other;
  }

  return mergedMetadata;
}