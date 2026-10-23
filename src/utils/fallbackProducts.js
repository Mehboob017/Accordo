const getCheapestVariant = (variants = [], isInStockFn, getPriceFn) => {
  if (!Array.isArray(variants) || !variants.length) return null;

  const inStock = variants.filter((variant) => isInStockFn(variant));
  const pool = inStock.length ? inStock : variants;

  return pool.reduce((min, variant) => {
    const value = getPriceFn(variant);
    const minValue = getPriceFn(min);
    return value < minValue ? variant : min;
  }, pool[0]);
};

const parseWeightAndUnit = (weightValue, fallbackUnit = '') => {
  if (weightValue == null || weightValue === '') {
    return { weight: null, unit: fallbackUnit };
  }

  if (typeof weightValue === 'number') {
    return { weight: weightValue, unit: fallbackUnit };
  }

  const text = String(weightValue).trim();
  const match = text.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);

  if (!match) {
    return { weight: text, unit: fallbackUnit };
  }

  const numeric = Number(match[1]);
  const unit = match[2].toLowerCase();

  return {
    weight: Number.isFinite(numeric) ? numeric : text,
    unit,
  };
};

const parseWeightFromText = (value, fallbackUnit = '') => {
  if (!value) return { weight: null, unit: fallbackUnit };

  const match = String(value)
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|mg|ml|l|capsule|capsules|tab|tabs|tablet|tablets)/);

  if (!match) return { weight: null, unit: fallbackUnit };

  const numeric = Number(match[1]);
  const unitMap = {
    gm: 'g',
    tabs: 'tab',
    tablets: 'tab',
    capsules: 'capsule',
  };

  return {
    weight: Number.isFinite(numeric) ? numeric : null,
    unit: unitMap[match[2]] || match[2],
  };
};

const mapVariantToLegacy = (variant, productId, isNewShape = false) => {
  if (!variant) return null;

  if (isNewShape) {
    const mrp = Number(variant.mrp ?? 0);
    const salePrice = Number(variant.disPrice ?? mrp);

    // console.log(variant);
    
    return {
      id: variant.uid,
      name: variant.name,
      price: mrp,
      quantity: Number(variant.stockQty ?? 0),
      stock_status: variant.inStockFlag ? 'in_stock' : 'out_of_stock',
      sale_price: salePrice,
      discount:
        mrp > 0 && salePrice < mrp
          ? Math.round(((mrp - salePrice) / mrp) * 100)
          : 0,
      sku: variant.skuCode,
      status: variant.status,
      product_id: productId,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      cover_image: variant.coverImage ?? null,
    };
  }

  return {
    ...variant,
    id: variant.id,
    name: variant.name,
    price: Number(variant.price ?? 0),
    quantity: Number(variant.quantity ?? 0),
    stock_status: variant.stock_status ?? 'out_of_stock',
    sale_price: Number(variant.sale_price ?? variant.price ?? 0),
    discount: Number(variant.discount ?? 0),
    sku: variant.sku,
  };
};

export const getFallbackProducts = (fallbackProductsData) => {
  if (Array.isArray(fallbackProductsData?.data?.products)) {
    return fallbackProductsData.data.products;
  }

  if (Array.isArray(fallbackProductsData?.data?.product)) {
    return fallbackProductsData.data.product;
  }

  if (Array.isArray(fallbackProductsData?.data)) {
    return fallbackProductsData.data;
  }

  return [];
};

export const normalizeProductForCard = (product) => {
  if (!product) return null;
  // console.trace(product);
  const isNewShape = Boolean(product.uid || product.productVariants);
  const uidAsNumber = String(product.uid || '').match(/(\d+)/)?.[1];
  const parsedId = uidAsNumber ? Number(uidAsNumber) : null;
  const productId = product.id ?? (Number.isFinite(parsedId) ? parsedId : product.uid);

  const legacyVariations = isNewShape
    ? (Array.isArray(product.productVariants) ? product.productVariants : []).map((variant) =>
        mapVariantToLegacy(variant, productId, true)
      )
    : (Array.isArray(product.variations) ? product.variations : []).map((variant) =>
        mapVariantToLegacy(variant, productId, false)
      );

  const selectedVariant = isNewShape
    ? getCheapestVariant(
        product.productVariants || [],
        (variant) => Boolean(variant?.inStockFlag),
        (variant) => Number(variant?.disPrice ?? variant?.mrp ?? Number.MAX_SAFE_INTEGER)
      )
    : getCheapestVariant(
        legacyVariations,
        (variant) => variant?.stock_status === 'in_stock',
        (variant) => Number(variant?.sale_price ?? variant?.price ?? Number.MAX_SAFE_INTEGER)
      );

  const price = isNewShape
    ? Number(selectedVariant?.mrp ?? product.price ?? 0)
    : Number(product.price ?? selectedVariant?.price ?? 0);
  const salePrice = isNewShape
    ? Number(selectedVariant?.disPrice ?? price)
    : Number(product.sale_price ?? selectedVariant?.sale_price ?? price);

  const discount =
    product.discount ??
    (price > 0 && salePrice < price
      ? Math.round(((price - salePrice) / price) * 100)
      : 0);

  const imageFromOld = product?.product_thumbnail?.original_url || product?.product_thumbnail;
  const imageFromNew = product?.coverImage;
  const productThumbnail = imageFromNew || imageFromOld || null;

  const categories = Array.isArray(product.categories)
    ? product.categories
    : product.category
      ? [product.category]
      : [];

  const weightFromVariantField = isNewShape
    ? parseWeightAndUnit(selectedVariant?.weight, '')
    : {
        weight: product.weight ?? null,
        unit: product.unit ?? null,
      };

  const weightFromVariantName = parseWeightFromText(selectedVariant?.name, '');
  const weightFromProductName = parseWeightFromText(product?.name, '');

  const derivedWeight = {
    weight:
      weightFromVariantField.weight ??
      weightFromVariantName.weight ??
      weightFromProductName.weight,
    unit:
      weightFromVariantField.unit ??
      weightFromVariantName.unit ??
      weightFromProductName.unit,
  };

  const reviewCount = Array.isArray(product.productReviews)
    ? product.productReviews.length
    : Number(product.reviewCount ?? 0);

  const avgRating = Array.isArray(product.productReviews) && product.productReviews.length
    ? product.productReviews.reduce((sum, review) => sum + Number(review?.ratings ?? 0), 0) /
      product.productReviews.length
    : Number(product.rating ?? 0);

  return {
    ...product,
    id: productId,
    slug: product.slug,
    name: product.name,
    short_description: product.short_description ?? product.shortDescription ?? '',
    description: product.description ?? '',
    ingredients: product.ingredients ?? '',
    indication: product.indication ?? '',
    dosage: product.dosage ?? '',
    availability: product.availability ?? '',
    benefits: product.benefits ?? '',
    caution: product.caution ?? '',
    type: product.type ?? (product.hasVariants ? 'classified' : 'simple'),
    unit: derivedWeight.unit,
    weight: derivedWeight.weight,
    quantity: Number(selectedVariant?.stockQty ?? selectedVariant?.quantity ?? product.quantity ?? 0),
    price,
    sale_price: salePrice,
    discount: Number(discount ?? 0),
    stock_status:
      product.stock_status ??
      (selectedVariant
        ? isNewShape
          ? selectedVariant.inStockFlag
            ? 'in_stock'
            : 'out_of_stock'
          : selectedVariant.stock_status
        : 'out_of_stock'),
    sku: product.sku ?? selectedVariant?.skuCode ?? selectedVariant?.sku ?? null,
    // is_featured: product.is_featured ?? (product.verifiedFlag ? 1 : 0),
    // is_sale_enable:
    //   product.is_sale_enable ??
    //   (salePrice < price ? 1 : 0),
    rating: Number.isFinite(avgRating) && avgRating,
    rating_count: Number(product.rating_count ?? reviewCount ?? 0),
    reviews_count: Number(reviewCount ?? 0),
    product_thumbnail: productThumbnail,
    categories,
    tags: Array.isArray(product.tags) ? product.tags : [],
    variations: legacyVariations,
  };
};

export const getFallbackProductsForCard = (fallbackProductsData, limit) => {
  const normalized = getFallbackProducts(fallbackProductsData)
    .map((product) => normalizeProductForCard(product))
    .filter(Boolean);

  if (typeof limit === 'number') {
    return normalized.slice(0, limit);
  }

  return normalized;
};
