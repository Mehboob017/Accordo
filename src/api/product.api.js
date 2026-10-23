import { getAuthHeaders } from '@/api/wishlist.api';
import { parseJsonOrEmpty } from "@/api/orders.api"

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getRepresentativeVariant = (variants) => {
  const safeVariants = Array.isArray(variants) ? variants : [];
  if (!safeVariants.length) return null;

  const inStockVariants = safeVariants.filter((variant) => variant?.inStockFlag);
  const pool = inStockVariants.length > 0 ? inStockVariants : safeVariants;

  return pool.reduce((min, variant) => {
    const price = variant?.disPrice ?? variant?.mrp ?? Infinity;
    const minPrice = min?.disPrice ?? min?.mrp ?? Infinity;
    return price < minPrice ? variant : min;
  }, pool[0]);
};

const getDiscount = (mrp, disPrice) =>
  mrp > 0 && disPrice < mrp ? Math.round(((mrp - disPrice) / mrp) * 100) : 0;

const getRatingMeta = (reviews, product) => {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const ratingCount = safeReviews.length;
  if (!ratingCount) {
    const rawRating = Number(product?.rating ?? 0);
    const rawReviewCount = Number(
      product?.reviewCount ?? product?.rating_count ?? product?.reviews_count ?? 0
    );
    return {
      rating: Number.isFinite(rawRating) ? rawRating : 0,
      rating_count: rawReviewCount,
      reviewCount: rawReviewCount,
    };
  }

  const total = safeReviews.reduce(
    (sum, review) => sum + Number(review?.rating ?? 0),
    0
  );
  return {
    rating: Number((total / ratingCount).toFixed(1)),
    rating_count: ratingCount,
    reviewCount: ratingCount,
  };
};

const RESERVED_PRODUCT_QUERY_KEYS = new Set([
  'page',
  'limit',
  'search',
  'department',
  'minPrice',
  'maxPrice',
  'price',
  'sort',
  'sortBy',
  'field',
]);

const appendDynamicFilterParams = (query, params = {}) => {
  Object.entries(params || {}).forEach(([key, value]) => {
    if (RESERVED_PRODUCT_QUERY_KEYS.has(key)) {
      return;
    }

    if (Array.isArray(value)) {
      const values = value.filter(Boolean).map((item) => String(item));

      if (values.length > 0) {
        query.set(key, values.join(','));
      }

      return;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      query.set(key, value.trim());
      return;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      query.set(key, String(value));
      return;
    }

    if (typeof value === 'boolean') {
      query.set(key, String(value));
    }
  });
};

/**
 * Normalize a raw API product object into the shape expected by existing UI components.
 * Maps camelCase fields → snake_case, derives type/pricing/stock from productVariants[].
 */
const normalizeProduct = (product) => {
  if (!product) return null;

  const variants = Array.isArray(product.productVariants) ? product.productVariants : [];
  // A product is "classified" (multi-variant) when hasVariants is true or multiple variants exist
  const hasVariants = product.hasVariants ?? (variants.length > 1);
  const type = hasVariants ? 'classified' : 'simple';

  // Derive top-level pricing/stock from the first (cheapest in-stock) variant
  const inStockVariants = variants.filter((v) => v.inStockFlag);
  const representativeVariant = getRepresentativeVariant(variants) ?? {};

  const mrp = representativeVariant.mrp ?? 0;
  const disPrice = representativeVariant.disPrice ?? mrp;
  const discount = getDiscount(mrp, disPrice);
  const normalizedCategory = product.category
    ? {
      ...product.category,
      slug: product.category.slug || toSlug(product.category.name),
    }
    : null;
  const ratingMeta = getRatingMeta(product.productReviews, product);

  return {
    // Spread raw fields so nothing is lost
    ...product,

    // Normalized identifier
    id: product.uid,

    // Type derived from variant count
    type,

    // Pricing (snake_case for old components)
    price: mrp,
    sale_price: disPrice,
    discount,

    // Stock (from representative variant)
    stock_status: representativeVariant.inStockFlag ? 'in_stock' : 'out_of_stock',
    quantity: representativeVariant.stockQty ?? 0,

    // SKU (from representative variant)
    sku: representativeVariant.skuCode ?? null,

    // Description aliases
    short_description: product.shortDescription ?? null,

    // Thumbnail alias
    product_thumbnail: product.coverImage ?? null,

    // consumer type
    consumer_type: product.customerType ?? null,

    // Categories as array (old components expect categories[])
    categories: normalizedCategory ? [normalizedCategory] : [],

    // Tags — API sends as comma-separated uid string; expose raw array if available
    tags: Array.isArray(product.tags) ? product.tags : [],

    // Sale / featured flags
    // is_sale_enable: disPrice < mrp,
    // is_featured: product.verifiedFlag ?? false,
    ...ratingMeta,

    // Variants mapped to snake_case shape for ProductAttribute
    variations: variants.map((v) => {
      const vMrp = v.mrp ?? 0;
      const vDis = v.disPrice ?? vMrp;
      return {
        id: v.uid,
        name: v.name,
        sku: v.skuCode ?? null,
        price: vMrp,
        sale_price: vDis,
        discount: getDiscount(vMrp, vDis),
        stock_status: v.inStockFlag ? 'in_stock' : 'out_of_stock',
        quantity: v.stockQty ?? 0,
        weight: v.weight ?? null,
        cover_image: v.coverImage ?? null,
        super_coins: v.coinsCount ?? null,
        // Preserve raw variant fields
        ...v,
      };
    }),
  };
};

export const fetchProducts = async (params = {}) => {
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const limit = Number(params.limit) > 0 ? Number(params.limit) : 40;
  const search = String(params.search || '').trim();
  const department = String(params.department || '').trim();
  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);
  const sort = String(params.sort || '').trim();

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) query.set('search', search);
  if (department) query.set('department', department);
  appendDynamicFilterParams(query, params);
  if (Number.isFinite(minPrice)) query.set('minPrice', String(minPrice));
  if (Number.isFinite(maxPrice)) query.set('maxPrice', String(maxPrice));
  if (sort) query.set('sort', sort);
  if (!query.has('platform')) {
    query.set('platform', 'web');
  }

  const url = `${SDL_BASE_URL}/product?${query.toString()}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch products (${res.status})`,
        data: {
          product: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
      };
    }

    const json = await res.json();
    const products = Array.isArray(json?.data?.product) ? json.data.product : [];
    const normalizedProducts = products.map(normalizeProduct).filter(Boolean);
    const pagination = json?.data?.pagination || {};

    return {
      ...json,
      data: {
        ...json.data,
        product: normalizedProducts,
        pagination: {
          total: Number(pagination.total ?? normalizedProducts.length ?? 0),
          page: Number(pagination.page ?? page),
          limit: Number(pagination.limit ?? limit),
          totalPages: Number(pagination.totalPages ?? 1),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch products',
      data: {
        product: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      },
    };
  }
};

/**
 * Fetch raw product details by slug — returns API response as-is, without normalization.
 * Used exclusively by the new PDP (/products/[slug]) route.
 * @param {string} slug - Product slug
 * @param {string} productVariant - Product variant identifier (optional) to fetch specific variant details on PDP
 * @param {boolean} isServer - If true, fetches public cacheable data without auth headers.
 */
export const fetchProductDetailRaw = async ({ slug, productVariant, isServer = false, platform = 'web' }) => {
  const query = new URLSearchParams();
  if (productVariant) query.set('productVariant', productVariant);
  if (platform) query.set('platform', platform);
  query.set('section', '1'); // 2, 3 for
  const queryString = query.toString();
  const url = `${SDL_BASE_URL}/product-new/${slug}${queryString ? `?${queryString}` : ''}`;

  try {
    const options = {
      headers: { 'Content-Type': 'application/json' },
    };

    if (isServer) {
      options.cache = 'force-cache';
      options.next = {
        revalidate: 300, // 5 minutes cache
        tags: [`product:${slug}:${productVariant || 'default'}`]
      };
    } else {
      options.headers = { ...options.headers, ...getAuthHeaders() };
      options.credentials = 'include';
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch product (${res.status})`,
        data: null,
      };
    }

    const json = await res.json();

    if (!json.success) {
      return {
        success: false,
        message: json.message || 'Failed to fetch product',
        data: null,
      };
    }

    return json;
  } catch (error) {
    console.error('Error fetching raw product:', error);

    return {
      success: false,
      message: error.message || 'Failed to fetch product',
      data: null,
    };
  }
};

/**
 * Fetch raw product details by section for the PDP.
 * @param {string} slug - Product slug
 * @param {number|string} section - Section number (1, 2, or 3)
 * @param {string} productVariant - Product variant identifier (optional)
 * @param {boolean} isServer - If true, fetches public cacheable data without auth headers.
 */
export const fetchProductDetailSection = async ({ slug, section, productVariant, isServer = false, platform = 'web' }) => {
  const query = new URLSearchParams();
  if (productVariant) query.set('productVariant', productVariant);
  if (platform) query.set('platform', platform);
  query.set('section', String(section));

  const queryString = query.toString();
  const url = `${SDL_BASE_URL}/product-new/${slug}${queryString ? `?${queryString}` : ''}`;

  try {
    const options = {
      headers: { 'Content-Type': 'application/json' },
    };

    if (isServer) {
      options.cache = 'force-cache';
      options.next = {
        revalidate: 300, // 5 minutes cache
        tags: [`product:${slug}:${productVariant || 'default'}`]
      };
    } else {
      options.headers = { ...options.headers, ...getAuthHeaders() };
      options.credentials = 'include';
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch product section ${section} (${res.status})`,
        data: null,
      };
    }

    const json = await res.json();

    if (!json.success) {
      return {
        success: false,
        message: json.message || `Failed to fetch product section ${section}`,
        data: null,
      };
    }

    return json;
  } catch (error) {
    console.error(`Error fetching product section ${section}:`, error);

    return {
      success: false,
      message: error.message || `Failed to fetch product section ${section}`,
      data: null,
    };
  }
};

/**
 * Fetch product images for the PDP sliders.
 */
export const fetchProductImages = async ({ slug, isServer = false }) => {
  const url = `${SDL_BASE_URL}/product/${slug}/images`;

  try {
    const options = {
      headers: { 'Content-Type': 'application/json' },
    };

    if (isServer) {
      options.cache = 'force-cache';
      options.next = {
        revalidate: 300,
        tags: [`product-images:${slug}`]
      };
    } else {
      options.headers = { ...options.headers, ...getAuthHeaders() };
      options.credentials = 'include';
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      return { success: false, data: null };
    }

    const json = await res.json();
    return json.success ? json : { success: false, data: null };
  } catch (error) {
    console.error(`Error fetching product images:`, error);
    return { success: false, data: null };
  }
};

/**
 * Fetch product details by slug
 * @param {string} slug - Product slug
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 */
export const fetchProductDetail = async (slug, platform = 'web') => {
  const query = new URLSearchParams();
  if (platform) query.set('platform', platform);
  const queryString = query.toString();
  const url = `${SDL_BASE_URL}/product-new/${slug}${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      credentials: 'include',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch product (${res.status})`,
        data: null,
      };
    }

    const json = await res.json();

    if (!json.success) {
      console.warn('API returned unsuccessful response:', json.message);
      return {
        success: false,
        message: json.message || 'Failed to fetch product',
        data: null,
      };
    }

    return {
      ...json,
      data: {
        ...json.data,
        product: normalizeProduct(json.data?.product),
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);

    return {
      success: false,
      message: error.message || 'Failed to fetch product',
      data: null,
    };
  }
};

/**
 * Fetch lightweight product data for the quick-view modal.
 * Returns coverImage, productVariants[].coverImage and productFiles (images).
 * @param {string} productUid - Product UID
 */
export const fetchProductModal = async (productUid) => {
  if (!productUid) {
    return { success: false, message: 'Product UID is required', data: null };
  }

  const url = `${SDL_BASE_URL}/productModal/${encodeURIComponent(productUid)}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      credentials: 'include',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch product modal (${res.status})`,
        data: null,
      };
    }

    const json = await res.json();

    if (!json.success) {
      return {
        success: false,
        message: json.message || 'Failed to fetch product modal',
        data: null,
      };
    }

    return json;
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch product modal',
      data: null,
    };
  }
};

/**
 * Resolve product route slugs by variant id.
 * @param {string} variantId - Product variant identifier
 * @returns {Promise<{productSlug: string, variantSlug: string}>}
 */
export const fetchProductRedirectByVariant = async (variantId) => {
  const normalizedVariantId = String(variantId || '').trim();

  if (!normalizedVariantId) {
    throw new Error('Variant id is required');
  }

  const url = `${SDL_BASE_URL}/redirect-product/${encodeURIComponent(normalizedVariantId)}`;

  const res = await fetch(url, {
    // cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || 'Failed to resolve product link');
  }

  const payload = json?.data || {};
  const productSlug = String(payload?.productSlug || '').trim();
  const variantSlug = String(payload?.variantSlug || '').trim();

  if (!productSlug) {
    throw new Error('Product link is unavailable for this item');
  }

  return {
    productSlug,
    variantSlug,
  };
};

export const submitProductReview = async ({ payload, trxUid }) => {
  const normalizedOrderItemUid = String(payload?.orderItemUid || '').trim();

  if (!normalizedOrderItemUid) {
    throw new Error('Order item uid is required');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/submit-review/${trxUid}`, {
    method: 'POST',
    // cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      ...payload,
      orderItemUid: normalizedOrderItemUid,
    }),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to submit product review');
  }

  return data;
};