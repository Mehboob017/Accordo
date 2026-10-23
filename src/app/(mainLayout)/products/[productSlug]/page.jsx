import { fetchProductDetailSection, fetchProductImages } from '@/api/product.api';
import ProductsDetailPage from '@/components/productsDetails/ProductsDetailPage';
import { getQueryClient } from '@/utils/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import {
  generateDynamicSeoMetadata,
  getDynamicSeo,
  SEO_TYPES,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const selectDefaultVariant = (variants = []) => {
  if (!variants.length) return null;
  const inStock = variants.filter((v) => v.inStockFlag);
  const pool = inStock.length > 0 ? inStock : variants;
  return pool.reduce((min, v) => {
    const price = v.disPrice ?? v.mrp ?? Infinity;
    const minPrice = min.disPrice ?? min.mrp ?? Infinity;
    return price < minPrice ? v : min;
  }, pool[0]);
};

async function getProductFallbackMetadata(productSlug) {
  const data = await fetchProductDetailSection({ slug: productSlug, section: 1, isServer: true }).catch(
    () => null
  );
  const product = data?.data?.product;

  if (!product) {
    return null;
  }

  const defaultVariant = data?.data?.selectedVariant || selectDefaultVariant(product.productVariants);

  const categoryName =
    product.category?.name ||
    product.department?.name ||
    undefined;

  const manufacturerName =
    product.manufacturedBy?.companyName ||
    product.manufacturer?.companyName ||
    undefined;

  const gtinCode = defaultVariant?.gstinCode || undefined;

  const mrp = defaultVariant?.mrp != null ? Number(defaultVariant.mrp) : undefined;
  const sellingPrice =
    defaultVariant?.disPrice != null
      ? Number(defaultVariant.disPrice)
      : mrp;

  const primaryImage =
    defaultVariant?.coverImage ||
    product?.coverImage ||
    undefined;

  return {
    title: product.name || 'Product Details',
    description:
      product.description || 'Explore product details and available variants.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com'}/products/${productSlug}`,
    },
    openGraph: {
      title: product.name || 'Product Details',
      description:
        product.description || 'Explore product details and available variants.',
      ...(primaryImage ? { images: [{ url: primaryImage }] } : {}),
    },
    product: {
      brand: product?.brand?.name,
      manufacturer: manufacturerName,
      category: categoryName,
      price: {
        amount: sellingPrice,
        currency: "INR",
      },
      mrp: mrp,
      availability: defaultVariant?.inStockFlag == true ? "In Stock" : "Out of Stock",
      retailerItemId: gtinCode || defaultVariant?.skuCode,
      condition: "new",
      ...(primaryImage ? { image: primaryImage } : {}),
    },
  };
}


function createProductSchema(productData, productSlug, imagesData) {
  const product = productData?.product;
  // const variant = productData?.selectedVariant || selectDefaultVariant(product?.productVariants);
  const variant = productData?.selectedVariant;

  if (!product || !variant) {
    return null;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com';

  const productUrl = `${siteUrl}/products/${productSlug}`;
  const webpageId = `${productUrl}#webpage`;
  const productId = `${productUrl}#product`;
  const breadcrumbId = `${productUrl}#breadcrumb`;
  const offerId = `${productUrl}#offer`;
  const brandId = `${siteUrl}/#brand`;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const categoryName =
    product.category?.name ||
    product.department?.name ||
    undefined;

  const manufacturerName =
    product.manufacturedBy?.companyName ||
    product.manufacturer?.companyName ||
    undefined;

  const gtinCode = variant.gstinCode || undefined;

  const mrp = variant.mrp != null ? Number(variant.mrp) : undefined;
  const sellingPrice =
    variant.disPrice != null
      ? Number(variant.disPrice)
      : mrp != null
        ? mrp
        : 0;

  // Collect image URLs: product cover image, variant cover image, and productFiles images
  const fetchedImages = imagesData?.data || {};
  const imageList = [];
  const seenImages = new Set();

  const addImage = (url) => {
    const cleanUrl = String(url || '').trim();
    if (cleanUrl && !seenImages.has(cleanUrl) && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      seenImages.add(cleanUrl);
      imageList.push(cleanUrl);
    }
  };

  // 1. Product cover image
  addImage(product?.coverImage || fetchedImages?.coverImage);

  // 2. Variant cover image
  addImage(variant?.coverImage);

  // 3. ProductFiles images (gallery)
  const productFiles = fetchedImages?.productFiles || product?.productFiles || [];
  if (Array.isArray(productFiles)) {
    productFiles.forEach((file) => {
      const fileType = String(file?.type || '').toLowerCase();
      if (!fileType || fileType === 'image') {
        addImage(file?.path || file?.image);
      }
    });
  }

  const returnDays = product.returnPeriod ? parseInt(product.returnPeriod, 10) : NaN;
  let returnPolicy = undefined;

  if (product.returnable === false) {
    returnPolicy = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    };
  } else if (product.returnable === true && !Number.isNaN(returnDays) && returnDays > 0) {
    returnPolicy = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: returnDays,
      returnMethod: 'https://schema.org/ReturnByMail',
    };
  }

  const faqId = `${productUrl}#faq`;

  // FAQ Entities from product.faqs only
  const productFaqs = Array.isArray(product?.faqs) ? product.faqs : [];
  const faqEntities = productFaqs
    .filter((f) => f && f.question && f.answer)
    .map((f) => ({
      '@type': 'Question',
      name: String(f.question).trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: String(f.answer)
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .trim(),
      },
    }));

  const faqNode =
    faqEntities.length > 0
      ? {
        '@type': 'FAQPage',
        '@id': faqId,
        mainEntity: faqEntities,
      }
      : null;

  // 1. WebPage Node
  const webpageNode = {
    '@type': 'WebPage',
    '@id': webpageId,
    url: productUrl,
    name: product.name,
    description: product.shortDescription || product.description || '',
    isPartOf: {
      '@id': websiteId,
    },
    about: {
      '@id': productId,
    },
    breadcrumb: {
      '@id': breadcrumbId,
    },
    ...(faqNode ? { mainEntity: { '@id': faqId } } : {}),
    publisher: {
      '@id': organizationId,
    },
    inLanguage: 'en-IN',
  };

  // 2. Product Node
  const productNode = {
    '@type': 'Product',
    '@id': productId,
    name: product.name,
    description: product.shortDescription || product.description || '',
    url: productUrl,
    ...(product.uid ? { productID: product.uid } : {}),
    ...(imageList.length > 0 ? { image: imageList } : {}),
    sku: variant.skuCode || undefined,
    ...(gtinCode ? { gtin: String(gtinCode) } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    brand: {
      '@id': brandId,
    },
    manufacturer: manufacturerName
      ? {
        '@type': 'Organization',
        name: manufacturerName,
      }
      : undefined,
    offers: {
      '@id': offerId,
    },
  };

  // Aggregate Rating
  if (
    product.rating !== null &&
    product.rating !== undefined &&
    product.reviewCount > 0
  ) {
    productNode.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Individual Customer Reviews
  const rawReviews = Array.isArray(productData?.productReviews)
    ? productData.productReviews
    : [];

  const reviews = rawReviews
    .filter((r) => r && (r.name || r.comment))
    .map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.name || 'Anonymous',
      },
      ...(r.rating != null
        ? {
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }
        : {}),
      reviewBody: r.comment || '',
    }));

  if (reviews.length > 0) {
    productNode.review = reviews;
  }

  // 3. Brand Node
  const brandNode = {
    '@type': 'Brand',
    '@id': brandId,
    name: product.brand?.name || 'Shree Dhootapapeshwar Limited | SDL India',
    url: siteUrl,
  };

  // 4. Offer Node
  // Shipping: ₹60 standard; free for orders ≥ ₹600
  const FREE_SHIPPING_THRESHOLD = 600;
  const SHIPPING_COST = 60;
  const isFreeShipping = sellingPrice >= FREE_SHIPPING_THRESHOLD;

  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: isFreeShipping ? 0 : SHIPPING_COST,
      currency: 'INR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
    },
    doesNotShip: false,
    ...(isFreeShipping
      ? { name: 'Free Shipping on orders above ₹600' }
      : { name: `Standard Shipping — ₹${SHIPPING_COST}` }),
  };

  const offerNode = {
    '@type': 'Offer',
    '@id': offerId,
    url: productUrl,
    priceCurrency: 'INR',
    price: sellingPrice,
    name: 'Discounted Price',
    ...(gtinCode ? { gtin: String(gtinCode) } : {}),
    ...(mrp != null
      ? {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/ListPrice',
          price: mrp,
          priceCurrency: 'INR',
          name: 'Maximum Retail Price (MRP)',
        },
      }
      : {}),
    availability:
      variant.inStockFlag === true
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    shippingDetails,
    ...(returnPolicy ? { hasMerchantReturnPolicy: returnPolicy } : {}),
  };

  // 5. BreadcrumbList Node
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
        name: 'Products',
        item: `${siteUrl}/collections`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      webpageNode,
      productNode,
      brandNode,
      offerNode,
      breadcrumbNode,
      ...(faqNode ? [faqNode] : []),
    ],
  };
}

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const path = `/products/${productSlug}`;

  const fallbackMetadata = await getProductFallbackMetadata(
    productSlug
  );

  return generateDynamicSeoMetadata(productSlug, SEO_TYPES.PRODUCT, {
    path,
    fallbackMetadata,
  });
}


const ProductDetailsPage = async ({ params }) => {
  const { productSlug } = await params;
  const path = `/products/${productSlug}`;

  const { schemas } = await getDynamicSeo(
    productSlug,
    SEO_TYPES.PRODUCT,
    path
  );

  const queryClient = getQueryClient();

  const [section1Data, section2Data, section3Data, imagesData] = await Promise.all([
    fetchProductDetailSection({ slug: productSlug, section: 1, isServer: true }).catch(() => null),
    fetchProductDetailSection({ slug: productSlug, section: 2, isServer: true }).catch(() => null),
    fetchProductDetailSection({ slug: productSlug, section: 3, isServer: true }).catch(() => null),
    fetchProductImages({ slug: productSlug, isServer: true }).catch(() => null)
  ]);

  if (section1Data?.success) {
    queryClient.setQueryData(['product', productSlug, 1, null], section1Data);
  }
  if (section2Data?.success) {
    queryClient.setQueryData(['product', productSlug, 2, null], section2Data);
  }
  if (section3Data?.success) {
    queryClient.setQueryData(['product', productSlug, 3, null], section3Data);
  }
  if (imagesData?.success) {
    queryClient.setQueryData(['product-images', productSlug], imagesData);
  }

  const productData = section1Data?.data ? {
    ...section1Data.data,
    productReviews: section3Data?.data?.productReviews || []
  } : null;

  // Create Product JSON-LD
  const productSchema = createProductSchema(
    productData,
    productSlug,
    imagesData
  );
  // console.log("PRODUCT SCHEMA DEBUG:", {
  //   productSlug,
  //   productExists: !!productData?.product,
  //   productName: productData?.product?.name,
  //   selectedVariant: productData?.selectedVariant,
  //   variantsCount: productData?.product?.productVariants?.length,
  //   productSchemaExists: !!productSchema,
  // });

  // Existing SEO schemas + Product schema
  const allSchemas = [
    ...schemas,
    ...(productSchema ? [productSchema] : []),
  ];

  // console.log(
  //   "ALL SCHEMAS:",
  //   allSchemas.map((schema) => ({
  //     type: schema?.["@type"],
  //     graphTypes: schema?.["@graph"]?.map((item) => item?.["@type"]),
  //   }))
  // );
  return (
    <>
      <SeoJsonLd schemas={allSchemas} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsDetailPage slug={productSlug} />
      </HydrationBoundary>
    </>
  );
};

export default ProductDetailsPage;
